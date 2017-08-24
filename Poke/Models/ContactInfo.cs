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

        public static ContactInfo FromJson(JSONObject obj)
        {
            var contactInfo = new ContactInfo();
            try
            {
                contactInfo.PhoneNumber = obj.GetString("phoneNumber");
                contactInfo.ID = obj.GetString("id");
                contactInfo.Name = obj.GetString("name");
            }
            catch (JSONException)
            {
                // Purposefully ignoring it...
                // As long as we get a phone number we are ok...
            }
            return contactInfo;
        }
    }
}