using System;
using System.Collections.Generic;
using Android.Content;
using Android.Provider;
using Poke.Models;
using Uri = Android.Net.Uri;

namespace Poke.Util
{
    public class Contact
    {
        /// <summary>
        /// Returns ContactInfo for the phone number.
        /// This may return more than 1 record if they have multiple
        /// contacts in their contact database that have the same number.
        /// </summary>
        /// <param name="phoneNumber">The phone number to look for.</param>
        /// <param name="context">The context to run the method under.</param>        
        /// <returns>A list of possible contacts.</returns>
        public static List<ContactInfo> FindContact(string phoneNumber, Context context)
        {
            var contactInfo = new List<ContactInfo>();

            var uri = Uri.WithAppendedPath(
                ContactsContract.CommonDataKinds.Phone.ContentFilterUri, Uri.Encode(phoneNumber));

            var projection = new[]
            {
                ContactsContract.CommonDataKinds.Phone.InterfaceConsts.Id,
                ContactsContract.CommonDataKinds.Phone.InterfaceConsts.DisplayName
            };

            var cursor = context.ContentResolver.Query(uri, projection, null, null, null, null);

            try
            {
                if (cursor.MoveToFirst())
                {
                    do
                    {
                        contactInfo.Add(new ContactInfo
                        {
                            ID = cursor.GetString(cursor.GetColumnIndexOrThrow(projection[0])),
                            Name = cursor.GetString(cursor.GetColumnIndexOrThrow(projection[1]))
                        });
                    } while (cursor.MoveToNext());
                }
            }
            finally
            {
                cursor.Close();
            }

            // Return the contact info that we found.
            return contactInfo;
        }
    }
}