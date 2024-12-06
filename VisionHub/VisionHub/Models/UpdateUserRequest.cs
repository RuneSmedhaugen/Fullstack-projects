namespace VisionHub.Models
{
    public class UpdateUserRequest
    {
        public int UserID { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? NewPassword { get; set; } // Optional
        public string? Biography { get; set; }
        public DateTime? BirthDate { get; set; } // Optional
    }
}
