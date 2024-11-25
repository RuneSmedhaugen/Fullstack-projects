namespace VisionHub.Models
{

        public class UserRegistrationDto
        {
            public string UserName { get; set; }
            public string Email { get; set; }
            public string Name { get; set; }
            public string Password { get; set; } // Use plain password
            public string? Biography { get; set; }
            public DateTime BirthDate { get; set; }
        }

}
