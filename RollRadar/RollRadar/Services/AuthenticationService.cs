using RollRadar.Models;

namespace RollRadar.Services
{
    public class AuthenticationService
    {
        private readonly UserService _userService;

        public AuthenticationService(UserService userService)
        {
            _userService = userService;
        }

        public Users Login(string email, string password)
        {
            var user = _userService.GetByEmail(email);
            return user != null && VerifyPassword(password, user.PasswordHash) ? user : null;
        }

        private bool VerifyPassword(string inputPassword, string hashedPassword)
        {
            string inputHash = _userService.HashPassword(inputPassword);
            return inputHash == hashedPassword;
        }
    }
}