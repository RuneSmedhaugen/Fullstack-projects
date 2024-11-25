using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using RollRadar.Models;
using RollRadar.Services;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly AuthenticationService _authenticationService;

    public UserController(IConfiguration configuration, AuthenticationService authenticationService)
    {
        _configuration = configuration;
        _authenticationService = authenticationService;
    }

    // Login method
    [HttpPost("login")]
    public async Task<ActionResult<string>> Login([FromBody] Users request) // Use Users directly for the login
    {
        // Authenticate the user
        var user = _authenticationService.Login(request.Email, request.PasswordHash); // Ensure the Users model includes Email and Password properties
        if (user == null)
        {
            return Unauthorized("Invalid credentials");
        }

        // Create token
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Email), // Use user's email as the subject
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.Now.AddMinutes(30),
            signingCredentials: creds);

        return Ok(new JwtSecurityTokenHandler().WriteToken(token)); // Returns the token as a string
    }
}