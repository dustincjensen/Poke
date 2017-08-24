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

        public static TcpClient Tcp;
        public static byte[] _receiveBuffer = new byte[4096];

        public static async Task SendToListeningDevice(string ipAddress, int portNumber, string userText)
        {
            if (Tcp == null)
            {
                Tcp = new TcpClient(ipAddress, portNumber);
                Tcp.Client.BeginReceive(_receiveBuffer, 0, _receiveBuffer.Length, SocketFlags.None, ReceiveCallback, null);
            }

            var msg = System.Text.Encoding.ASCII.GetBytes(userText + "<EOF>");
            await Tcp.Client.SendAsync(new ArraySegment<byte>(msg), SocketFlags.None);
        }

        public static void ReceiveCallback(IAsyncResult result)
        {
            //Check how much bytes are recieved and call EndRecieve to finalize handshake
            var received = Tcp.Client.EndReceive(result);

            if (received <= 0)
                return;

            // Copy the recieved data into new buffer , to avoid null bytes
            var recData = new byte[received];
            Buffer.BlockCopy(_receiveBuffer, 0, recData, 0, received);

            // Process data here the way you want , all your bytes will be stored in recData
            var outputString = System.Text.Encoding.ASCII.GetString(recData);
            // Send message to the person...
            SendToSelf("FILL_IN_TO_DEBUG", outputString);

            // Start receiving again
            Tcp.Client.BeginReceive(_receiveBuffer, 0, _receiveBuffer.Length, SocketFlags.None, ReceiveCallback, null);
        }
    }
}