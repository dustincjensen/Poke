using System;
using System.Security.Cryptography;
using Org.Json;

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

        public string ToJson()
        {
            var publicKey = new JSONObject();
            publicKey.Put("n", Modulus);
            publicKey.Put("e", Exponent);
            return publicKey.ToString();
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

        public RSAParameters ToRsaParameters()
        {
            var exp = Convert.FromBase64String(Exponent);
            return new RSAParameters
            {
                Exponent = exp,
                Modulus = Convert.FromBase64String(Modulus)
            };
        }

        public static PublicKey FromRsaParameters(RSAParameters rsa)
        {
            var pk = new PublicKey
            {
                Modulus = Convert.ToBase64String(rsa.Modulus),
                Exponent = Convert.ToBase64String(rsa.Exponent)
            };
            return pk;
        }
    }
}