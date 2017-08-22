using System;
using System.Globalization;
using Android.App;
using Android.Widget;
using Android.OS;

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
            FindViewById<Button>(Resource.Id.MyButton).Click += _HandleButtonClick;
        }

        private void _HandleButtonClick(object sender, EventArgs args)
        {
            Util.Sms.SendToSelf("FILL_IN_TO_DEBUG", DateTime.UtcNow.ToString(CultureInfo.CurrentCulture));
        }
    }
}

