using System;
using System.Collections.Generic;
using System.Globalization;
using System.Resources;
using System.Security.Cryptography;
using System.Threading.Tasks;
using Android.App;
using Android.Content.PM;
using Android.Database;
using Android.Widget;
using Android.OS;
using Org.Json;
using Poke.Models;
using Poke.Util;

namespace Poke.Activities
{
    [Activity(Label = "Poke", MainLauncher = true, Icon = "@drawable/icon")]
    public class MainActivity : Activity
    {
        private Button _sendtestMessageButton;
        private ListView _possibleListenerDevices;
        private TextView _emptyListenerDevices;
        private DeviceAuthenticationModalFragment _deviceAuthenticationModalFragment;

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

            // Add click event to the button
            _sendtestMessageButton = FindViewById<Button>(Resource.Id.SendTestMessageButton);
            _sendtestMessageButton.Click += _HandleButtonClick;

            // Find the Empty Text View for Listener Devices
            _emptyListenerDevices = FindViewById<TextView>(Resource.Id.EmptyListenerDevices);

            // Add Adapter to the Listenr Devices
            _possibleListenerDevices = FindViewById<ListView>(Resource.Id.PossibleListenerDevices);
            _possibleListenerDevices.Adapter = new DeviceRowAdapter(this, new List<Device>());
            _possibleListenerDevices.EmptyView = _emptyListenerDevices;
            _possibleListenerDevices.ItemClick += _HandleListClick;                        

            // TODO this should come from a broadcast of somekind.
            _SetupDebugDevice();
        }

        private void _HandleButtonClick(object sender, EventArgs args)
        {
            //Util.Sms.SendTo("FILL_IN_TO_DEBUG", DateTime.UtcNow.ToString(CultureInfo.CurrentCulture));
            //_ShowModalWithPassword();

            //var passcode = Crypto.CreateUniquePasswordForIdentifyingConnectedDevice(5);
            //var aes = Crypto.CreateAesKeyIV(passcode);
            //var encrypted = Crypto.EncryptWithAesKeyIV("We are awesome!", aes);
        }

        private void _HandleListClick(object sender, AdapterView.ItemClickEventArgs args)
        {
            var position = args.Position;
            var item = ((DeviceRowAdapter)_possibleListenerDevices.Adapter).GetItem(position);

            // Set the Tcp Connection up. That way you don't actually need to wait
            // for a message to be sent to start sending messages from the "server".
            TcpHandler.SetupTcpConnection(item.IpAddress, item.Port);

            // Communicate your public key...
            var publicPrivate = Crypto.GetPublicPrivateKey();
            _privateKey = publicPrivate[1];
            var publicKey = new JSONObject();
            publicKey.Put("n", Convert.ToBase64String(publicPrivate[0].Modulus));
            publicKey.Put("e", Convert.ToBase64String(publicPrivate[0].Exponent));

            var aes = Crypto.CreateAesKeyIV("GAMMA");
            var encrypted = Crypto.EncryptWithAesKeyIV(publicKey.ToString(), aes);

            Task.Run(async () => await TcpHandler.StartConversation(encrypted + "<BEG>"));

            Toast.MakeText(
                Application.Context, 
                Application.Context.GetString(Resource.String.DeviceSelected), 
                ToastLength.Long).Show();
        }

        private void _ShowModalWithPassword()
        {
            // Gets a password to use
            var password = Crypto.CreateUniquePasswordForIdentifyingConnectedDevice(5);

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

        private void _SetupDebugDevice()
        {
            var device = new Device
            {
                Name = "Home",
                IpAddress = "192.168.1.12",
                Port = 8971
            };

            ((DeviceRowAdapter)_possibleListenerDevices.Adapter).Add(device);
        }
    }
}

