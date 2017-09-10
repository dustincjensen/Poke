using System;
using System.Security.Cryptography;
using Java.Math;
using Org.Json;
using Poke.Util;

namespace Poke.Models
{
    public class PublicKey
    {
        /// <summary>
        /// Modulus == n
        /// </summary>
        public string Modulus { get; set; }

        /// <summary>
        /// Exponent == e
        /// </summary>
        public string Exponent { get; set; }

        public RSAParameters ToRsaParameters()
        {
            var exp = Convert.FromBase64String(Exponent);

            return new RSAParameters
            {
                Exponent = exp, //new byte[] { 1, 0, 1 }, // TODO need to figure out how to do this?
                Modulus = Convert.FromBase64String(Modulus)
            };
        }

        public static PublicKey FromJson(JSONObject obj)
        {
            var payload = new PublicKey
            {
                Modulus = obj.GetString("n"),
                Exponent = obj.GetString("e")
            };
            return payload;
        }
    }
}