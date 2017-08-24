using System;
using System.Net.Sockets;
using System.Threading.Tasks;
using Android.Telephony;

namespace Poke.Util
{
    public class Sms
    {
        public static void SendTo(string phoneNumber, string message)
        {
            var smsManager = SmsManager.Default;
            smsManager.SendTextMessage(phoneNumber, null, message, null, null);
        }
    }
}