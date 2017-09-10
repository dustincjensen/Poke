using System;
using System.Collections.Generic;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using Poke.Models;

namespace Poke.Util
{
    public static class Crypto
    {
        private const string ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        private const string PASSWORD_SALT = "RandomSaltForThePassword";

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

        public static List<RSAParameters> GetPublicPrivateKey()
        {
            var rsa = new RSACryptoServiceProvider(2048);
            var publicKey = rsa.ExportParameters(false);
            var privateKey = rsa.ExportParameters(true);
            return new List<RSAParameters> { publicKey, privateKey };
        }

        public static byte[] EncryptWithPublicKey(RSAParameters publicKey, byte[] value)
        {
            var rsa = new RSACryptoServiceProvider();
            rsa.ImportParameters(publicKey);
            var encryptedBytes = rsa.Encrypt(value, true);
            return encryptedBytes;
        }

        /// <summary>
        /// Create an AesManaged Key and Initialization Vector.
        /// </summary>
        public static AesKeyIV CreateAesKeyIV()
        {
            var aes = new AesManaged
            {
                Mode = CipherMode.CBC
            };

            return new AesKeyIV
            { 
                Key = aes.Key,
                IV = aes.IV
            };
        }

        /// <summary>
        /// Create an AesManaged Key and Initialization Vector.
        /// </summary>
        /// <param name="passcode"></param>
        /// <returns></returns>
        public static AesKeyIV CreateAesKeyIV(string passcode)
        {
            var salt = Encoding.UTF8.GetBytes(PASSWORD_SALT);

            using (var derived = new Rfc2898DeriveBytes(passcode, salt, 10000))
            {
                var aes = new AesManaged
                {
                    Mode = CipherMode.CBC,
                    Key = derived.GetBytes(32),
                    IV = derived.GetBytes(16)
                };

                return new AesKeyIV
                {
                    Key = aes.Key,
                    IV = aes.IV
                };
            }
        }

        /// <summary>
        /// Encrypt the string with the aesKeyIV.
        /// </summary>
        /// <param name="json">The string to encrypt.</param>
        /// <param name="aesKeyIV">The Key and IV to encrypt with.</param>
        public static string EncryptWithAesKeyIV(string json, AesKeyIV aesKeyIV)
        {
            var aes = new AesManaged
            {
                IV = aesKeyIV.IV,
                Key = aesKeyIV.Key,
                Mode = CipherMode.CBC
            };
            var jsonBytes = Encoding.UTF8.GetBytes(json);
            using (var encryptor = aes.CreateEncryptor())
            {
                var stream = new MemoryStream();
                var cs = new CryptoStream(stream, encryptor, CryptoStreamMode.Write);
                cs.Write(jsonBytes, 0, jsonBytes.Length);
                cs.Close();
                return Hex.FromByteArray(stream.ToArray());
            }
        }

        /// <summary>
        /// Decrypt the string with the aesKeyIV.
        /// </summary>
        /// <param name="encryptedString">The string to decrypt.</param>
        /// <param name="aesKeyIV">The Key and IV to decryipt with.</param>
        public static string DecryptWithAesKeyIV(string encryptedString, AesKeyIV aesKeyIV)
        {
            var aes = new AesManaged
            {
                IV = aesKeyIV.IV,
                Key = aesKeyIV.Key,
                Mode = CipherMode.CBC
            };
            var encryptedBytes = Hex.ToByteArray(encryptedString);
            using (var decryptor = aes.CreateDecryptor())
            {
                var stream = new MemoryStream();
                var cs = new CryptoStream(stream, decryptor, CryptoStreamMode.Write);
                cs.Write(encryptedBytes, 0, encryptedBytes.Length);
                cs.Close();
                return Encoding.UTF8.GetString(stream.ToArray());
            }
        }
    }
}