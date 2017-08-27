using Android.OS;
using Android.Widget;

namespace Poke.Util
{
    public class DeviceAuthenticationTimer : CountDownTimer
    {
        private readonly ProgressBar _progressBar;
        private readonly System.Action _onFinishAction;

        public DeviceAuthenticationTimer(long millisInFuture, long countDownInterval, ProgressBar progressBar, System.Action onFinishAction) 
            : base(millisInFuture, countDownInterval)
        {
            _progressBar = progressBar;
            _onFinishAction = onFinishAction;
        }

        public override void OnFinish()
        {
            _progressBar.Progress = 0;
            _onFinishAction.Invoke();
        }

        public override void OnTick(long millisUntilFinished)
        {
            _progressBar.Progress = (int)millisUntilFinished/1000;
        }
    }
}