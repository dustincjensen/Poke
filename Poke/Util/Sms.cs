using System;
using System.Net.Sockets;
using System.Threading.Tasks;
using Android.Telephony;

namespace Poke.Util
{
    public class Sms
    {
        /// <summary>
        /// This can now handle larger messages that need to be split into parts.
        /// However the TCP buffer still limits the size of message we can send.
        /// </summary>
        /// <param name="phoneNumber">The phone number to send the message to.</param>
        /// <param name="message">The message to send.</param>
        public static void SendTo(string phoneNumber, string message)
        {
            var smsManager = SmsManager.Default;
            var messages = smsManager.DivideMessage(message);
            smsManager.SendMultipartTextMessage(phoneNumber, null, messages, null, null);
        }
    }
}