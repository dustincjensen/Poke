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
    }
}