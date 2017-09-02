using System;

namespace Poke.Util
{
    public static class Hex
    {
        public static string FromByteArray(byte[] bytes)
        {
            var hex = BitConverter.ToString(bytes);
            return hex.Replace("-", "");
        }

        public static byte[] ToByteArray(string hex)
        {
            var numberOfCharacters = hex.Length;
            var bytes = new byte[numberOfCharacters/2];
            for (var i = 0; i < numberOfCharacters; i += 2)
            {
                bytes[i/2] = Convert.ToByte(hex.Substring(i, 2), 16);
            }
            return bytes;
        }
    }
}