using System;
using System.Threading.Tasks;
using Android.App;
using Android.Content;
using Android.Provider;
using Android.Telephony;
using Android.Widget;
using Poke.Models;
using Poke.Util;

namespace Poke.Receivers
{
    [BroadcastReceiver(Enabled = true)]
    [IntentFilter(new[] { Telephony.Sms.Intents.SmsReceivedAction })]
    public class IncomingSms : BroadcastReceiver
    {
        public override void OnReceive(Context context, Intent intent)
        {
            // If we don't have a connection we aren't storing messages
            // to send at a later date, so just jump out.
            if (!TcpHandler.HasTcpConnection) return;

            // Retrieves a map of extended data from the intent.
            var bundle = intent.Extras;

            try
            {
                if (bundle != null)
                {
                    var pdusObj = (Java.Lang.Object[])bundle.Get("pdus");
                    foreach (var t in pdusObj)
                    {
                        var currentMessage = SmsMessage.CreateFromPdu((byte[])t, bundle.GetString("format"));
                        var phoneNumber = currentMessage.DisplayOriginatingAddress;
                        var message = currentMessage.DisplayMessageBody;

                        // We possibly could find multiple contacts with the same
                        // phone number. The app does nothing to stop this.
                        var contacts = Contact.FindContact(phoneNumber, context);

                        // If we only have 1 contact show that name.
                        var tcpPayload = new TcpPayload
                        {
                            Contact = contacts.Count >= 1
                                ? contacts[0]
                                : new ContactInfo {ID = "-1", PhoneNumber = phoneNumber, Name = null},
                            Message = message
                        };

                        Task.Run(async () =>
                        {
                            await TcpHandler.SendToListeningDevice(tcpPayload);
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                Android.Util.Log.Error("SMS_READ", ex.Message);
            }
        }
    }
}