namespace VisionHub.Models
{
    public abstract class BaseModel
    {
        private int _id;

        public int Id
        {
            get => _id;
            set => _id = value;
        }

        public BaseModel(int id)
        {
            Id = id;
        }

        public BaseModel()
        {
        }
    }
}