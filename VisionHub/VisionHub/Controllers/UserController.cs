using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using VisionHub.Models;
using VisionHub.Services;


namespace VisionHub.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly IConfiguration _configuration;

        public UserController(UserService userService, IConfiguration configuration)
        {
            _configuration = configuration;
            _userService = userService;
        }

        [HttpPost("register")]
        public IActionResult RegisterUser([FromBody] UserRegistrationDto model)
        {
            try
            {
                _userService.AddUser(
                    model.UserName,
                    model.Email,
                    model.Name,
                    model.Password, // Pass plain password
                    model.Biography,
                    model.BirthDate
                );

                return Ok(new { message = "User registered successfully!" });
            }
            catch (Exception ex)
            {
                
                return BadRequest(new { message = "An error occurred while registering the user.", error = ex.Message });
            }
        }


        // PUT api/user/update
        [HttpPut("update")]
        public IActionResult UpdateUser([FromBody] Users model)
        {
            try
            {
                _userService.UpdateUser(model.Id, model.UserName, model.Name, model.Email, model.PasswordHash, model.Biography, model.BirthDate);
                return Ok(new { message = "User updated successfully!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE api/user/{id}
        [HttpDelete("{id}")]
        public IActionResult DeleteUser(int id)
        {
            try
            {
                _userService.RemoveUser(id);
                return Ok(new { message = "User deleted successfully!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET api/user/{id}
        [HttpGet("{id}")]
        public IActionResult GetUser(int id)
        {
            try
            {
                var users = _userService.GetUserInfo(id);
                if (users.Count == 0)
                {
                    return NotFound(new { message = "User not found!" });
                }
                return Ok(users[0]);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }


        // GET api/user/all
        [HttpGet("all")]
        public IActionResult GetAllUsers()
        {
            try
            {
                var users = _userService.GetAllUsers();
                return Ok(users);
            }
            catch (Exception ex)
            {
                // Log exception details
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginModel model)
        {
            var user = _userService.ValidateUser(model.Username, model.Password);

            if (user == null)
            {
                return Unauthorized(new { message = "Username or password is incorrect" });
            }

            var token = GenerateJwtToken(user);

            return Ok(new
            {
                token = token,
                userId = user.Id,
                username = user.UserName
            });
        }


        private string GenerateJwtToken(Users user)
        {
            // Generate a JWT token here
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:SecretKey"]); // Use the secret key from configuration
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.UserName)
                }),
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}

