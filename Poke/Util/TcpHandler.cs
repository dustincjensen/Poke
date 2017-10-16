using System;
using System.Net.Sockets;
using System.Threading.Tasks;
using Org.Json;
using Poke.Activities;
using Poke.Models;
using Android.Content;

namespace Poke.Util
{
    public class TcpHandler
    {
        public static TcpClient Tcp;
        public static bool HasTcpConnection => Tcp != null && Tcp.Connected;

        private static Context _context = null;

        // TODO handle messages larger than buffer.
        private static readonly byte[] ReceiveBuffer = new byte[8192];
        private static string WholeMessage = null;
        public static string _sharedPasscode = null;
        private static AesKeyIV _sharedSymmetricKey = null;

        public static void SetupTcpConnection(string ipAddress, int portNumber, Context context)
        {
            // Close the tcp connection gracefully before setting up the new one.
            Tcp?.Close();

            // Store the main activity context so we can query contacts later.
            _context = context;

            // Setup the new Tcp connection.
            Tcp = new TcpClient(ipAddress, portNumber);
            Tcp.Client.BeginReceive(ReceiveBuffer, 0, ReceiveBuffer.Length,
                SocketFlags.None, ReceiveCallback, null);
        }

        public static async Task SendToListeningDevice(TcpPayload payload)
        {
            // We encrypt our messages with the shared sym key.
            var json = payload.ToJson();
            var encrypted = Crypto.EncryptWithAesKeyIV(json.ToString(), _sharedSymmetricKey);
            var msg = System.Text.Encoding.UTF8.GetBytes(encrypted + "<EOF>");
            await Tcp.Client.SendAsync(new ArraySegment<byte>(msg), SocketFlags.None);
        }

        public static async Task StartConversation(string encryptedMessage)
        {
            var msgBytes = System.Text.Encoding.UTF8.GetBytes(encryptedMessage);
            await Tcp.Client.SendAsync(new ArraySegment<byte>(msgBytes), SocketFlags.None);
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
                //var jsonString = System.Text.Encoding.ASCII.GetString(recData);
                //var payload = TcpPayload.FromJson(new JSONObject(jsonString));

                //if (!string.IsNullOrWhiteSpace(payload.Contact.PhoneNumber) &&
                //    !string.IsNullOrWhiteSpace(payload.Message))
                //{
                //    Sms.SendTo(payload.Contact.PhoneNumber, payload.Message);
                //}
                //else
                //{
                //    // TODO maybe this shouldn't be thrown? Maybe it is a ping to keep the socket alive.
                //    throw new NotImplementedException("Did not receive a phone number or message.");
                //}

                var encryptedString = System.Text.Encoding.UTF8.GetString(recData);

                WholeMessage = string.IsNullOrWhiteSpace(WholeMessage)
                        ? encryptedString
                        : WholeMessage + encryptedString;

                // This is the reply to the start of the interaction.
                // If we can decrypt here, then we send back the _sym
                // key we will be using to encrypt our messages.
                if (WholeMessage.EndsWith("<BEG>"))
                {
                    WholeMessage = WholeMessage.Replace("<BEG>", "");
                    var decryptedString = Crypto.DecryptWithAesKeyIV(WholeMessage, Crypto.CreateAesKeyIV(_sharedPasscode));
                    var publicKey = PublicKey.FromJson(new JSONObject(decryptedString));

                    // Send a new AES Symmetric key for using!
                    _sharedSymmetricKey = Crypto.CreateAesKeyIV();
                    var encryptedWithTheirPublicKey = Crypto.EncryptWithPublicKey(
                        publicKey.ToRsaParameters(), System.Text.Encoding.UTF8.GetBytes(_sharedSymmetricKey.ToJson().ToString()));
                    Task.Run(async () => await StartConversation(Convert.ToBase64String(encryptedWithTheirPublicKey) + "<END>"));

                    WholeMessage = null;
                }
                else if (WholeMessage.EndsWith("<TAC>"))
                {
                    // The computer asked for the client list...
                    // we shall send it to them encrypted!
                    var contacts = Contact.GetAllContacts(_context);
                    var jsonArray = ContactInfo.ToJsonArray(contacts);
                    var encrypted = Crypto.EncryptWithAesKeyIV(jsonArray.ToString(), _sharedSymmetricKey);
                    var msg = System.Text.Encoding.UTF8.GetBytes(encrypted + "<TAC>");
                    Task.Run(async () => await Tcp.Client.SendAsync(new ArraySegment<byte>(msg), SocketFlags.None));

                    WholeMessage = null;
                }
                else if (WholeMessage.EndsWith("<EOF>"))
                {
                    // This is an encrypted message from the computer.
                    WholeMessage = WholeMessage.Replace("<EOF>", "");
                    var decryptedString = Crypto.DecryptWithAesKeyIV(WholeMessage, _sharedSymmetricKey);
                    var payload = TcpPayload.FromJson(new JSONObject(decryptedString));

                    if (!string.IsNullOrWhiteSpace(payload.Contact.PhoneNumber) &&
                        !string.IsNullOrWhiteSpace(payload.Message))
                    {
                        // TODO Possible send delay so we don't  overload the sms manager?
                        Sms.SendTo(payload.Contact.PhoneNumber, payload.Message);
                    }
                    else
                    {
                        // Log an issue...
                    }

                    WholeMessage = null;
                }

                // Start receiving again
                Tcp.Client.BeginReceive(ReceiveBuffer, 0, ReceiveBuffer.Length, 
                    SocketFlags.None, ReceiveCallback, null);
            }
            catch (Exception ex)
            {
                Android.Util.Log.Error("Receive Callback", ex.Message);

                // Clear the whole message
                WholeMessage = null;

                // Start receiving again
                if (Tcp.Client != null)
                {
                    Tcp.Client.BeginReceive(ReceiveBuffer, 0, ReceiveBuffer.Length,
                        SocketFlags.None, ReceiveCallback, null);
                }                
            }
        }
    }
}