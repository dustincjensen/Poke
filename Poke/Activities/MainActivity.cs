using System;
using System.Collections.Generic;
using System.Globalization;
using System.Resources;
using Android.App;
using Android.Database;
using Android.Widget;
using Android.OS;
using Poke.Models;

namespace Poke.Activities
{
    [Activity(Label = "Poke", MainLauncher = true, Icon = "@drawable/icon")]
    public class MainActivity : Activity
    {
        private Button _sendtestMessageButton;
        private ListView _possibleListenerDevices;
        private TextView _emptyListenerDevices;

        protected override void OnCreate(Bundle bundle)
        {
            base.OnCreate(bundle);
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
            Util.Sms.SendToSelf("FILL_IN_TO_DEBUG", DateTime.UtcNow.ToString(CultureInfo.CurrentCulture));
        }

        private void _HandleListClick(object sender, AdapterView.ItemClickEventArgs args)
        {
            var position = args.Position;
            var item = ((DeviceRowAdapter)_possibleListenerDevices.Adapter).GetItem(position);

            ApplicationRuntime.Device = item;
            Toast.MakeText(
                Application.Context, 
                Application.Context.GetString(Resource.String.DeviceSelected), 
                ToastLength.Long).Show();
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

