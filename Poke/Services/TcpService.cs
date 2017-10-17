using System;
using System.Text;

using Android.App;
using Android.Content;
using Android.OS;
using Android.Runtime;
using System.Net.Sockets;
using Poke.Models;
using System.Threading.Tasks;
using Poke.Util;
using Org.Json;
using Poke.Activities;

namespace Poke.Services
{
    [Service(Label = "TcpService")]
    public class TcpService : Service
    {
        public const string ACTION_START = "poke.poke.ACTION_START";
        public const string ACTION_SET_PASSCODE_AND_START_CONVERSATION = "poke.poke.ACTION_SET_PASSCODE_AND_START_CONVERSATION";
        public const string ACTION_START_CONVERSATION = "poke.poke.ACTION_START_CONVERSATION";
        public const string ACTION_SEND_MESSAGE = "poke.poke.ACTION_SEND_MESSAGE";

        [return: GeneratedEnum]
        public override StartCommandResult OnStartCommand(Intent intent, [GeneratedEnum] StartCommandFlags flags, int startId)
        {
            switch (intent.Action)
            {
                case ACTION_START:
                    StartForeground(9073, _buildNotification());
                    SetupTcpConnection(intent.GetStringExtra("ipAddress"), intent.GetIntExtra("portNumber", 3000));
                    break;
                case ACTION_SET_PASSCODE_AND_START_CONVERSATION:
                    _sharedPasscode = intent.GetStringExtra("passcode");
                    Task.Run(async () => await StartConversation(intent.GetStringExtra("encryptedMessage")));
                    break;
                case ACTION_START_CONVERSATION:
                    Task.Run(async () => await StartConversation(intent.GetStringExtra("encryptedMessage")));
                    break;
                case ACTION_SEND_MESSAGE:
                    Task.Run(async () => await SendToListeningDevice(intent.GetStringExtra("payload")));
                    break;
            }

            return StartCommandResult.Sticky;
        }

        public override void OnDestroy()
        {
            StopForeground(true);
            _DisconnectAndCleanUp();
            base.OnDestroy();
        }

        public override IBinder OnBind(Intent intent)
        {
            return null;
        }

        private Notification _buildNotification()
        {
            var resultIntent = new Intent(this, typeof(MainActivity));

            var resultPendingIntent = PendingIntent.GetActivity(
                this, 0, resultIntent, PendingIntentFlags.UpdateCurrent);

            return new Notification.Builder(this)
                .SetSmallIcon(Resource.Drawable.Stick)
                .SetContentTitle("Poke")
                .SetContentText("Listening for sms in the background...")
                .SetContentIntent(resultPendingIntent).Build();
        }


        public static TcpClient Tcp;
        public static bool HasTcpConnection => Tcp != null && Tcp.Connected;

        // TODO handle messages larger than buffer.
        private readonly byte[] ReceiveBuffer = new byte[8192];
        private string WholeMessage = null;
        public string _sharedPasscode = null;
        private AesKeyIV _sharedSymmetricKey = null;

        public void SetupTcpConnection(string ipAddress, int portNumber)
        {
            // Close the tcp connection gracefully before setting up the new one.
            Tcp?.Close();

            // Setup the new Tcp connection.
            // TODO connect async, this would allow us to catch the failed connection attempts
            Tcp = new TcpClient(ipAddress, portNumber);
            Tcp.Client.BeginReceive(ReceiveBuffer, 0, ReceiveBuffer.Length,
                SocketFlags.None, ReceiveCallback, null);
        }

        public async Task SendToListeningDevice(string payload)
        {
            // We encrypt our messages with the shared sym key.
            var encrypted = Crypto.EncryptWithAesKeyIV(payload, _sharedSymmetricKey);
            var msg = Encoding.UTF8.GetBytes(encrypted + "<EOF>");
            await Tcp.Client.SendAsync(new ArraySegment<byte>(msg), SocketFlags.None);
        }

        public async Task StartConversation(string encryptedMessage)
        {
            var msgBytes = Encoding.UTF8.GetBytes(encryptedMessage);
            await Tcp.Client.SendAsync(new ArraySegment<byte>(msgBytes), SocketFlags.None);
        }

        public void _DisconnectAndCleanUp()
        {
            if (Tcp?.Client?.Connected == true)
                Tcp.Client.Shutdown(SocketShutdown.Both);
            Tcp?.Close();
            Tcp = null;
            WholeMessage = null;
            _sharedPasscode = null;
            _sharedSymmetricKey = null;
        }

        public void ReceiveCallback(IAsyncResult result)
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

                var encryptedString = Encoding.UTF8.GetString(recData);

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
                    var contacts = Contact.GetAllContacts(this);
                    var jsonArray = ContactInfo.ToJsonArray(contacts);
                    var encrypted = Crypto.EncryptWithAesKeyIV(jsonArray.ToString(), _sharedSymmetricKey);
                    var msg = Encoding.UTF8.GetBytes(encrypted + "<TAC>");
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
            catch (SocketException ex)
            {
                Android.Util.Log.Error("Receive Callback", ex.Message);
                OnDestroy();
            }
            catch (Exception ex)
            {
                Android.Util.Log.Error("Receive Callback", ex.Message);

                // Clear the whole message
                WholeMessage = null;

                // Start receiving again
                if (Tcp != null && Tcp.Client != null)
                {
                    Tcp.Client.BeginReceive(ReceiveBuffer, 0, ReceiveBuffer.Length,
                        SocketFlags.None, ReceiveCallback, null);
                }
            }
        }
    }
}