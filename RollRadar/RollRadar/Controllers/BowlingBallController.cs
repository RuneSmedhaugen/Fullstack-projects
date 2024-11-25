using Microsoft.AspNetCore.Authorization; // Import this if you're using authorization
using Microsoft.AspNetCore.Mvc;
using RollRadar.Models;
using RollRadar.Services;
using System.Collections.Generic;
using System.Security.Claims; // Needed for claims-based identity
using System.Threading.Tasks;

namespace RollRadar.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Ensure only authenticated users can access this controller
    public class BowlingBallController : ControllerBase
    {
        private readonly BowlingBallService _bowlingBallService;

        public BowlingBallController(BowlingBallService bowlingBallService)
        {
            _bowlingBallService = bowlingBallService;
        }

        // GET: api/BowlingBall
        [HttpGet]
        public async Task<ActionResult<List<BowlingBalls>>> GetAllBowlingBalls()
        {
            var balls = await _bowlingBallService.GetAllBowlingBalls();
            return Ok(balls);
        }

        // POST: api/BowlingBall
        [HttpPost]
        public async Task<ActionResult> AddBowlingBall([FromBody] BowlingBalls ball)
        {
            if (ball == null)
            {
                return BadRequest("Bowling ball data is required.");
            }

            // Retrieve userId from claims
            int userId = GetUserIdFromClaims();
            if (userId == 0) // Check if userId is valid
            {
                return Unauthorized("User not authenticated.");
            }

            ball.UserId = userId; // Set the userId for the bowling ball
            await _bowlingBallService.AddBowlingBall(ball, userId);
            return CreatedAtAction(nameof(GetAllBowlingBalls), new { id = ball.Id }, "Bowling ball added successfully.");
        }

        // PUT: api/BowlingBall/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult> EditBowlingBall(int id, [FromBody] BowlingBalls ball)
        {
            if (ball == null)
            {
                return BadRequest("Bowling ball data is required.");
            }

            ball.Id = id; // Set the ID of the ball to update
            int userId = GetUserIdFromClaims(); // Retrieve userId from claims

            if (userId == 0) // Check if userId is valid
            {
                return Unauthorized("User not authenticated.");
            }

            ball.UserId = userId; // Set the userId for the bowling ball

            await _bowlingBallService.UpdateBowlingBall(ball);
            return Ok("Bowling ball updated successfully.");
        }

        // DELETE: api/BowlingBall/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteBowlingBall(int id)
        {
            int userId = GetUserIdFromClaims(); // Retrieve userId from claims

            if (userId == 0) // Check if userId is valid
            {
                return Unauthorized("User not authenticated.");
            }

            await _bowlingBallService.DeleteBowlingBall(id, userId);
            return Ok("Bowling ball deleted successfully.");
        }

        // Method to get the current user's ID from claims
        private int GetUserIdFromClaims()
        {
            var userClaim = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier); // Assuming you're using NameIdentifier for user ID
            return userClaim != null ? int.Parse(userClaim.Value) : 0; // Parse and return the userId
        }
    }
}
