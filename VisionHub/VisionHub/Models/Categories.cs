namespace VisionHub.Models
{
    public class Categories : BaseModel
    {
        private string _name;
        private string _description;
       
        public string Name { get { return _name; } set { _name = value; } }
        public string Description { get { return _description; } set { _description = value; } }

        public Categories(int id, string name, string description) :base (id)
        {
            Name = name;
            Description = description;
        }

        public Categories()
        {
            
        }
    }
}
