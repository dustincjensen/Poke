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
            FindViewById<Button>(Resource.Id.SendTestMessageButton).Click += _HandleButtonClick;

            var aa = new DeviceRowAdapter(this, new List<Device>());
            aa.Add(new Device() { Name = "Random PC X", IpAddress = "192.168.1.8", Port = "3000" });
            aa.Add(new Device() { Name = "Random PC Y", IpAddress = "192.168.1.18", Port = "1260" });
            aa.Add(new Device() { Name = "Random PC Z", IpAddress = "192.168.1.88", Port = "4500" });
            aa.Add(new Device() { Name = "Random PC A", IpAddress = "192.168.1.98", Port = "5000" });
            aa.Add(new Device() { Name = "Random PC B", IpAddress = "192.168.1.87", Port = "8971" });
            aa.Add(new Device() { Name = "Random PC C", IpAddress = "192.168.1.183", Port = "6549" });
            aa.Add(new Device() { Name = "Random PC D", IpAddress = "192.168.1.1", Port = "3216" });
            aa.Add(new Device() { Name = "Random PC E", IpAddress = "192.168.1.3", Port = "9514" });
            aa.Add(new Device() { Name = "Random PC F", IpAddress = "192.168.1.89", Port = "8524" });
            aa.Add(new Device() { Name = "Random PC G", IpAddress = "192.168.1.111", Port = "9994" });
            aa.Add(new Device() { Name = "Random PC H", IpAddress = "192.168.1.12", Port = "6321" });
            aa.Add(new Device() { Name = "Random PC I", IpAddress = "192.168.1.19", Port = "7784" });
            aa.Add(new Device() { Name = "Random PC J", IpAddress = "192.168.1.27", Port = "3219" });
            aa.Add(new Device() { Name = "Random PC K", IpAddress = "192.168.1.23", Port = "3000" });


            var list = (ListView)FindViewById(Resource.Id.PossibleListenerDevices);
            list.Adapter = aa;
        }

        public override void OnContentChanged()
        {
            base.OnContentChanged();

            var emptyView = FindViewById(Resource.Id.EmptyListenerDevices);
            var list = (ListView) FindViewById(Resource.Id.PossibleListenerDevices);
            list.EmptyView = emptyView;
        }

        private void _HandleButtonClick(object sender, EventArgs args)
        {
            Util.Sms.SendToSelf("FILL_IN_TO_DEBUG", DateTime.UtcNow.ToString(CultureInfo.CurrentCulture));
        }
    }
}

