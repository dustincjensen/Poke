using Android.App;
using Android.OS;
using Android.Widget;
using Poke.Util;

namespace Poke.Activities
{
    public class DeviceAuthenticationModalFragment : DialogFragment
    {
        public string DeviceAuthenicationPassword { get; set; }
        public ProgressBar DeviceAuthenticationTimeLimitProgressBar { get; set; }

        private TextView _passwordTextView;
        private TextView _instructionsTextView;

        /// <summary>
        /// TODO stop the dialog from closing when pressing the back button or handle it gracefully.
        /// </summary>
        /// <param name="savedInstanceState"></param>
        /// <returns></returns>
        public override Dialog OnCreateDialog(Bundle savedInstanceState)
        {
            // Use this to return your custom view for this Fragment
            // Create your fragment here
            var builder = new AlertDialog.Builder(Activity);

            // Get the layout inflater
            var inflater = Activity.LayoutInflater;

            // Get view components
            var content = inflater.Inflate(Resource.Layout.DeviceAuthenticationModal, null);
            _passwordTextView = content.FindViewById<TextView>(Resource.Id.DeviceAuthenticationPassword);
            _instructionsTextView = content.FindViewById<TextView>(Resource.Id.DeviceAuthenticationInstructions);
            var progressBar = content.FindViewById<ProgressBar>(Resource.Id.DeviceAuthenticationTimeLimit);

            // Save the text to the bundle state
            // and set the text view.
            _passwordTextView.Text = DeviceAuthenicationPassword;

            // Inflate and set the layout for the dialog
            // Pass null as the parent view because its going in the dialog layout
            builder.SetView(content)
                .SetNegativeButton(Resource.String.Cancel, (sender, args) =>
                {
                    Dialog.Dismiss();
                });

            // Get the number of seconds our timer should wait before the authentication expires.
            var numberOfSeconds = Resources.GetInteger(Resource.Integer.DeviceAuthenticationTimeoutSeconds);
            var timer = new DeviceAuthenticationTimer(numberOfSeconds * 1000, 100, progressBar, _TimerRunOut);

            // Delay starting the timer for 1 second so the modal can appear.
            new Handler().PostDelayed(() => { timer.Start(); }, 1000);            

            // Create the modal.
            var alertDialog = builder.Create();

            // Stop the dialog from being dismissed unless they press cancel specifically...
            alertDialog.SetCanceledOnTouchOutside(false);

            return alertDialog;
        }

        private void _TimerRunOut()
        {
            // The timer may run out AFTER we press the cancel button.
            if (Context != null)
            {
                _passwordTextView.Text = Context.Resources.GetString(
                Resource.String.DeviceAuthenticationPasswordTimedOut);
                _instructionsTextView.Text = Context.Resources.GetString(
                    Resource.String.DeviceAuthenticationInstructionsTimedOut);
            }            
        }
    }
}