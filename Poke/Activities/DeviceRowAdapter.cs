using System.Collections.Generic;
using Android.Content;
using Android.Views;
using Android.Widget;
using Poke.Models;

namespace Poke.Activities
{
    public class DeviceRowAdapter : ArrayAdapter<Device>
    {
        public DeviceRowAdapter(Context context, List<Device> devices)
            : base(context, 0, devices)
        {
        }

        public override View GetView(int position, View convertView, ViewGroup parent)
        {
            var device = GetItem(position);

            if (convertView == null)
            {
                convertView = LayoutInflater.From(Context)
                    .Inflate(Resource.Layout.DeviceRow, parent, false);
            }

            convertView.FindViewById<TextView>(Resource.Id.DeviceName).Text = device.Name;
            convertView.FindViewById<TextView>(Resource.Id.DeviceIpAddress).Text = $"{Context.Resources.GetString(Resource.String.IpAddress)} : {device.IpAddress}";
            convertView.FindViewById<TextView>(Resource.Id.DevicePort).Text = $"{Context.Resources.GetString(Resource.String.Port)} : {device.Port}";

            return convertView;
        }
    }
}