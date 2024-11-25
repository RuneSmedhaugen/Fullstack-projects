using Microsoft.AspNetCore.Mvc;

namespace VisionHub.Models
{
    public class Artworks : BaseModel
    {
        private int _userID;
        private int _categoryID;
        private string _title;
        private string _description;
        private string _imagePath;
        private DateTime _uploadDate = DateTime.Now;
        private bool _isFeatured;

        public int UserID { get { return _userID; } set { _userID = value; } }
        public string Title { get { return _title; } set { _title = value; } }
        public string Description { get { return _description; } set { _description = value; } }
        public DateTime UploadDate { get { return _uploadDate; } private set { _uploadDate = value; } }
        public string ImagePath { get { return _imagePath; } set { _imagePath = value; } }
        public int CategoryId { get { return _categoryID; } set { _categoryID = value; } }
        public bool IsFeatured { get { return _isFeatured; } set { _isFeatured = value; } }

        public Artworks(int id, int userID, int categoryId, string title, string description, string imagePath, DateTime uploadDate) : base(id)
        {
            UserID = userID;
            CategoryId = categoryId;
            Title = title;
            Description = description;
            ImagePath = imagePath;

        }

        public Artworks()
        {
            
        }
    }
}
