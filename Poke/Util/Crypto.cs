using System;
using System.Security.Cryptography;
using System.Text;

namespace Poke.Util
{
    public static class Crypto
    {
        private const string ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

        /// <summary>
        /// Creates a unique password that should be easily human readable
        /// and type-able within a 30 second rotating window.
        /// </summary>
        /// <param name="length"></param>
        /// <returns></returns>
        public static string CreateUniquePasswordForIdentifyingConnectedDevice(int length)
        {
            var res = new StringBuilder();
            using (var rng = new RNGCryptoServiceProvider())
            {
                var uintBuffer = new byte[sizeof(uint)];

                while (length-- > 0)
                {
                    rng.GetBytes(uintBuffer);
                    var num = BitConverter.ToUInt32(uintBuffer, 0);
                    res.Append(ALPHABET[(int)(num % (uint)ALPHABET.Length)]);
                }
            }

            return res.ToString();
        }
    }
}