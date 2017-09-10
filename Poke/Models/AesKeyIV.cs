using System;
using Org.Json;

namespace Poke.Models
{
    public class AesKeyIV
    {
        public byte[] Key { get; set; }
        public byte[] IV { get; set; }

        public JSONObject ToJson()
        {
            var jo = new JSONObject();
            jo.Put("key", Convert.ToBase64String(Key));
            jo.Put("iv", Convert.ToBase64String(IV));
            return jo;
        }
    }
}