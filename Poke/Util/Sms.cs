using System;
using System.Net.Sockets;
using System.Threading.Tasks;
using Android.Telephony;

namespace Poke.Util
{
    public class Sms
    {
        public static void SendToSelf(string phoneNumber, string message)
        {
            var smsManager = SmsManager.Default;
            smsManager.SendTextMessage(phoneNumber, null, message, null, null);
        }

        public static async Task SendToListeningDevice(string ipAddress, int portNumber, string userText)
        {
            var tcp = new TcpClient(ipAddress, portNumber);
            var msg = System.Text.Encoding.ASCII.GetBytes(userText + "<EOF>");
            await tcp.Client.SendAsync(new ArraySegment<byte>(msg), SocketFlags.None);
            tcp.Client.Close();
        }
    }
}