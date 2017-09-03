using System;
using System.Net.Sockets;
using System.Threading.Tasks;
using Org.Json;
using Poke.Models;

namespace Poke.Util
{
    public class TcpHandler
    {
        public static TcpClient Tcp;
        public static bool HasTcpConnection => Tcp != null && Tcp.Connected;

        // TODO handle messages larger than buffer.
        private static readonly byte[] ReceiveBuffer = new byte[4096];

        public static void SetupTcpConnection(string ipAddress, int portNumber)
        {
            // Close the tcp connection gracefully before setting up the new one.
            Tcp?.Close();

            // Setup the new Tcp connection.
            Tcp = new TcpClient(ipAddress, portNumber);
            Tcp.Client.BeginReceive(ReceiveBuffer, 0, ReceiveBuffer.Length,
                SocketFlags.None, ReceiveCallback, null);
        }

        public static async Task SendToListeningDevice(TcpPayload payload)
        {
            var json = payload.ToJson();
            var msg = System.Text.Encoding.ASCII.GetBytes(json + "<EOF>");
            await Tcp.Client.SendAsync(new ArraySegment<byte>(msg), SocketFlags.None);
        }

        public static void ReceiveCallback(IAsyncResult result)
        {
            try
            {
                // Check how much bytes are received and call EndReceive to finalize handshake
                var received = Tcp.Client.EndReceive(result);

                // If we have received nothing then leave.
                if (received <= 0)
                    return;

                // Copy the recieved data into new buffer , to avoid null bytes
                var recData = new byte[received];
                Buffer.BlockCopy(ReceiveBuffer, 0, recData, 0, received);

                // Get the message and send it to....
                // Send message to the person...
                var jsonString = System.Text.Encoding.ASCII.GetString(recData);
                var payload = TcpPayload.FromJson(new JSONObject(jsonString));

                if (!string.IsNullOrWhiteSpace(payload.Contact.PhoneNumber) &&
                    !string.IsNullOrWhiteSpace(payload.Message))
                {
                    Sms.SendTo(payload.Contact.PhoneNumber, payload.Message);
                }
                else
                {
                    // TODO maybe this shouldn't be thrown? Maybe it is a ping to keep the socket alive.
                    throw new NotImplementedException("Did not receive a phone number or message.");
                }

                // Start receiving again
                Tcp.Client.BeginReceive(ReceiveBuffer, 0, ReceiveBuffer.Length, 
                    SocketFlags.None, ReceiveCallback, null);
            }
            catch (Exception ex)
            {
                Android.Util.Log.Error("Receive Callback", ex.Message);
            }
        }
    }
}