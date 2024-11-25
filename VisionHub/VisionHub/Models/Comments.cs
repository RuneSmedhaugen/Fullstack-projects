namespace VisionHub.Models
{
    public class Comments : BaseModel
    {
        private int _artworkID;
        private int _userID;
        private string _commentText;
        private DateTime _commentDate = DateTime.Now;
        private string _username;

        public string Username
        {
            get { return _username; }
            set { _username = value; }
        }

        public int ArtworkID
        {
            get { return _artworkID; }
            set { _artworkID = value; }
        }

        public int UserID
        {
            get { return _userID; }
            set { _userID = value; }
        }

        public string CommentText
        {
            get { return _commentText; }
            set { _commentText = value; }
        }

        public DateTime CommentDate
        {
            get { return _commentDate; }
            private set { _commentDate = value; }
        }

        public Comments(int id, int artworkID, int userID, string commentText, string username) : base(id)
        {
            ArtworkID = artworkID;
            UserID = userID;
            CommentText = commentText;
            Username = username;
        }

        public Comments()
        {
            
        }
    }
}
