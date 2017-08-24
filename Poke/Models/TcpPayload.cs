using Org.Json;

namespace Poke.Models
{
    public class TcpPayload
    {
        public ContactInfo Contact { get; set; }
        public string Message { get; set; }

        public JSONObject ToJson()
        {
            var jo = new JSONObject();
            jo.Put("contact", Contact.ToJson());
            jo.Put("message", Message);
            return jo;
        }

        public static TcpPayload FromJson(JSONObject obj)
        {
            var payload = new TcpPayload
            {
                Contact = ContactInfo.FromJson(obj.GetJSONObject("contact")),
                Message = obj.GetString("message")
            };
            return payload;
        }
    }
}