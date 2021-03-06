﻿using System;
using System.Linq;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Threading.Tasks;
using Android.App;
using Android.Content.PM;
using Android.Widget;
using Android.OS;
using Org.Json;
using Poke.Models;
using Poke.Util;
using Android.Content;
using Poke.Services;
using System.Net.Sockets;
using System.Net;

namespace Poke.Activities
{
    [Activity(Label = "Poke", MainLauncher = true, Icon = "@drawable/stick")]
    public class MainActivity : Activity
    {
        private ListView _possibleListenerDevices;
        private TextView _emptyListenerDevices;
        private DeviceAuthenticationModalFragment _deviceAuthenticationModalFragment;

        private LinearLayout _connectingToDevice;
        private TextView _connectingText;
        private Button _disconnectButton;
        private Button _findDevicesButton;

        // TODO this needs to stored somewhere else...
        public static RSAParameters _privateKey;

        protected override void OnCreate(Bundle bundle)
        {
            base.OnCreate(bundle);

            // TODO this solves orientation problems resetting progress bars and stuff
            // TODO remove and handle orientation properly.
            RequestedOrientation = ScreenOrientation.Portrait;
            _SetupActivity();
        }

        private void _SetupActivity()
        {
            // Set our view from the "main" layout resource
            SetContentView(Resource.Layout.Main);

            // Find the Empty Text View for Listener Devices
            _emptyListenerDevices = FindViewById<TextView>(Resource.Id.EmptyListenerDevices);

            // Find the connecting progress bar section
            _connectingToDevice = FindViewById<LinearLayout>(Resource.Id.ConnectingLayout);
            _connectingText = FindViewById<TextView>(Resource.Id.ConnectingText);

            // Find the disconnect button
            _disconnectButton = FindViewById<Button>(Resource.Id.DisconnectButton);
            _disconnectButton.Click += _HandleDisconnectClick;
            // if the tcp server has a connection when we setup the activity... we should show the button
            if (TcpService.HasTcpConnection)
            {
                _disconnectButton.Visibility = Android.Views.ViewStates.Visible;
            }

            _findDevicesButton = FindViewById<Button>(Resource.Id.FindDeviceButton);
            _findDevicesButton.Click += _FindDevices;

            // Add Adapter to the Listenr Devices
            _possibleListenerDevices = FindViewById<ListView>(Resource.Id.PossibleListenerDevices);
            _possibleListenerDevices.Adapter = new DeviceRowAdapter(this, new List<Device>());
            _possibleListenerDevices.EmptyView = _emptyListenerDevices;
            _possibleListenerDevices.ItemClick += _HandleListClick;
        }

        private void _HandleDisconnectClick(object sender, EventArgs eventArgs)
        {
            var intent = new Intent(this, typeof(TcpService));
            StopService(intent);
        }

        private void _HandleListClick(object sender, AdapterView.ItemClickEventArgs args)
        {
            Task.Run(async () => await _HandleListClickAsync(sender, args));
        }

        private async Task _HandleListClickAsync(object sender, AdapterView.ItemClickEventArgs args)
        {
            RunOnUiThread(() =>
            {
                // Show the loading... symbol.
                _possibleListenerDevices.Visibility = Android.Views.ViewStates.Gone;
                _emptyListenerDevices.Visibility = Android.Views.ViewStates.Gone;
                _connectingToDevice.Visibility = Android.Views.ViewStates.Visible;
                _connectingText.Text = "Connecting to device...";
            });            

            // Select the device
            var position = args.Position;
            var item = ((DeviceRowAdapter)_possibleListenerDevices.Adapter).GetItem(position);

            // Set the Tcp Connection up. That way you don't actually need to wait
            // for a message to be sent to start sending messages from the "server".
            _StartConnectionIntent(item.IpAddress, item.Port);


            RunOnUiThread(() =>
            {
                // Communicate your public key...
                _connectingText.Text = "Generating Public/Private Key...";
            });

            var publicPrivate = Crypto.GetPublicPrivateKey();
            _privateKey = publicPrivate[1];
            var publicKey = PublicKey.FromRsaParameters(publicPrivate[0]);

            // Gets a password to use
            var password = Crypto.CreateUniquePasswordForIdentifyingConnectedDevice(5);
            var aes = Crypto.CreateAesKeyIV(password);
            var encrypted = Crypto.EncryptWithAesKeyIV(publicKey.ToJson(), aes);

            RunOnUiThread(() =>
            {
                _ShowModalWithPassword(password);

                // Turn off the loading... symbol.
                _disconnectButton.Visibility = Android.Views.ViewStates.Visible;
                _possibleListenerDevices.Visibility = Android.Views.ViewStates.Visible;
                _emptyListenerDevices.Visibility = Android.Views.ViewStates.Visible;
                _connectingToDevice.Visibility = Android.Views.ViewStates.Gone;
                _connectingText.Text = "";
            });

            // Send to the Tcp Handler to let the Desktop know we are doing this!
            _SendSharedPasscodeAndStartConversationIntent(password, encrypted + "<BEG>");
        }

        private void _StartConnectionIntent(string ipAddress, int port)
        {
            var intent = new Intent(this, typeof(TcpService));
            intent.SetAction(TcpService.ACTION_START);
            intent.PutExtra("ipAddress", ipAddress);
            intent.PutExtra("portNumber", port);
            StartService(intent);
        }

        private void _SendSharedPasscodeAndStartConversationIntent(string passcode, string encryptedMessage)
        {
            var intent = new Intent(this, typeof(TcpService));
            intent.SetAction(TcpService.ACTION_SET_PASSCODE_AND_START_CONVERSATION);
            intent.PutExtra("passcode", passcode);
            intent.PutExtra("encryptedMessage", encryptedMessage);
            StartService(intent);
        }

        private void _ShowModalWithPassword(string password)
        {
            // Show the UI for the modal and add device authentication modal
            // fragment to the modal with the password.
            var transaction = FragmentManager.BeginTransaction();
            var previous = FragmentManager.FindFragmentByTag("deviceAuthenticationModal");
            if (previous != null)
            {
                transaction.Remove(previous);
            }
            transaction.AddToBackStack(null);

            _deviceAuthenticationModalFragment = new DeviceAuthenticationModalFragment
            {
                DeviceAuthenicationPassword = password
            };
            _deviceAuthenticationModalFragment.Show(transaction, "deviceAuthenticationModal");
        }

        private void _FindDevices(object sender, EventArgs eventArgs)
        {
            ((DeviceRowAdapter)_possibleListenerDevices.Adapter).Clear();
            Task.Run(async () => await _FindDevicesAsync());
        }

        private async Task _FindDevicesAsync()
        {
            var udp = new UdpClient(11000, AddressFamily.InterNetwork)
            {
                EnableBroadcast = true
            };
            udp.Client.SetSocketOption(SocketOptionLevel.Socket, SocketOptionName.ReceiveTimeout, 5000);

            Task.Run(async () => await _StartReceivingUdp(udp));

            var msg = System.Text.Encoding.UTF8.GetBytes("This is the message from android.");

            for (var i = 0; i < 10; i++)
            {
                await udp.SendAsync(msg, msg.Length, new IPEndPoint(IPAddress.Broadcast, 5555));
                await Task.Delay(300);
            }
        }

        private async Task _StartReceivingUdp(UdpClient udp)
        {
            var devices = new List<Device>();
            var timespan = TimeSpan.FromSeconds(5);
            var datetime = DateTime.Now;
            var remoteEP = new IPEndPoint(IPAddress.Any, 11000);

            while (DateTime.Now <= datetime + timespan)
            {
                var asyncResult = udp.BeginReceive(null, null);
                asyncResult.AsyncWaitHandle.WaitOne(500);
                
                if (asyncResult.IsCompleted)
                {
                    try
                    {
                        var data = udp.EndReceive(asyncResult, ref remoteEP);
                        var json = System.Text.Encoding.UTF8.GetString(data);
                        var obj = new JSONObject(json);

                        var ip = obj.GetString("ipAddress");
                        var name = obj.GetString("name");
                        var port = obj.GetInt("port");

                        if (!devices.Any(x => x.IpAddress == ip))
                        {
                            devices.Add(new Device()
                            {
                                Name = name,
                                IpAddress = ip,
                                Port = port
                            });
                        }
                    }
                    catch (Exception)
                    {

                    }
                }
            }

            
            RunOnUiThread(() =>
            {
                if (devices.Any())
                {
                    ((DeviceRowAdapter)_possibleListenerDevices.Adapter).AddAll(devices);
                }
            });                
            
            udp.Close();
            udp.Dispose();
        }
    }
}

