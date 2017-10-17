using System;
using System.Threading.Tasks;
using Android.App;
using Android.Content;
using Android.Provider;
using Android.Telephony;
using Android.Widget;
using Poke.Models;
using Poke.Util;
using Poke.Services;

namespace Poke.Receivers
{
    [BroadcastReceiver(Enabled = true)]
    [IntentFilter(new[] { Telephony.Sms.Intents.SmsReceivedAction })]
    public class IncomingSms : BroadcastReceiver
    {
        // TODO investigate and ensure that a single receive will
        // only ever come from 1 source and not multiple sources like
        // the pdusObj might suggest.
        public override void OnReceive(Context context, Intent intent)
        {
            // If we don't have a connection we aren't storing messages
            // to send at a later date, so just jump out.
            if (!TcpService.HasTcpConnection) return;

            // Retrieves a map of extended data from the intent.
            var bundle = intent.Extras;

            try
            {
                if (bundle != null)
                {
                    var pdusObj = (Java.Lang.Object[])bundle.Get("pdus");
                    var tcpPayload = new TcpPayload
                    {
                        Contact = new ContactInfo { ID = "-1", PhoneNumber = null, Name = null },
                        Message = ""
                    };

                    foreach (var t in pdusObj)
                    {
                        var currentMessage = SmsMessage.CreateFromPdu((byte[])t, bundle.GetString("format"));
                        var phoneNumber = currentMessage.DisplayOriginatingAddress;
                        var message = currentMessage.DisplayMessageBody;

                        if (tcpPayload.Contact.PhoneNumber != null)
                        {
                            // We already have the phone number so just append the message.
                            tcpPayload.Message += message;
                        }
                        else
                        {
                            // We possibly could find multiple contacts with the same
                            // phone number. The app does nothing to stop this.
                            var contacts = Contact.FindContact(phoneNumber, context);


                            if (contacts.Count >= 1)
                            {
                                // If we only have 1 contact show that name.
                                tcpPayload.Contact = contacts[0];
                            }
                            else
                            {
                                // Otherwise we no contact so just put the phone number in.
                                tcpPayload.Contact.PhoneNumber = phoneNumber;
                            }

                            tcpPayload.Message = message;
                        }
                    }

                    if (tcpPayload.Contact.PhoneNumber != null &&
                        !string.IsNullOrWhiteSpace(tcpPayload.Message))
                    {
                        var outgoingIntent = new Intent(context, typeof(TcpService));
                        outgoingIntent.SetAction(TcpService.ACTION_SEND_MESSAGE);
                        outgoingIntent.PutExtra("payload", tcpPayload.ToJson().ToString());
                        context.StartService(outgoingIntent);
                    }
                    else
                    {
                        throw new Exception($"We parsed the message, but something when wrong. Phone Number: {tcpPayload.Contact.PhoneNumber}. Message: {tcpPayload.Message}.");
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