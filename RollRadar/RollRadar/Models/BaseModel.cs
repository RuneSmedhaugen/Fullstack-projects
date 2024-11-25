namespace RollRadar.Models
{
    public class BaseModel
    {
        private string _name;
        private int _id;
        private string _image;
        private string _comments;

        public string Name
        {
            get { return _name; }
            set { _name = value; }
        }

        public int Id
        {
            get { return _id; }
            set { _id = value; }
        }

        public string Image
        {
            get { return _image; }
            set { _image = value; }
        }

        public string Comments
        {
            get { return _comments; }
            set { _comments = value; }
        }

        public BaseModel(string name, string image, string comments)
        {
            _image = image;
            _comments = comments;
            _name = name;
        }

        public BaseModel()
        {
            
        }
    }
}
