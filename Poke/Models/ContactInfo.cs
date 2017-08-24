using Org.Json;

namespace Poke.Models
{
    public class ContactInfo
    {
        public string ID { get; set; }
        public string PhoneNumber { get; set; }
        public string Name { get; set; }

        public JSONObject ToJson()
        {
            var json = new JSONObject();
            json.Put("id", ID);
            json.Put("phoneNumber", PhoneNumber);
            json.Put("name", Name);
            return json;
        }
    }
}