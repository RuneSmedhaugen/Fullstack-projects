using Microsoft.AspNetCore.Mvc;
using VisionHub.Models;
using VisionHub.Services;
using System.IO;
using System.Threading.Tasks;

namespace VisionHub.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ArtworkController : ControllerBase
    {
        private readonly ArtworkService _artworkService;

        public ArtworkController(ArtworkService artworkService)
        {
            _artworkService = artworkService;
        }

        // POST api/artwork/add
        [HttpPost("add")]
        public async Task<IActionResult> AddArtwork([FromForm] FileUploadModel model, [FromForm] int userID, [FromForm] int categoryId, [FromForm] string title, [FromForm] string description, [FromForm] bool isFeatured)
        {
            if (model == null || model.File == null)
            {
                return BadRequest("No file uploaded.");
            }

            try
            {
                // Call the service to upload the artwork and save it to the database
                await _artworkService.AddArt(userID, categoryId, title, description, model, isFeatured);
                return Ok(new { Message = "Artwork uploaded successfully!" });
            }
            catch (Exception ex)
            {
                return BadRequest($"Error uploading artwork: {ex.Message}");
            }
        }

        // GET api/artwork/{id}
        [HttpGet("{id}")]
        public IActionResult GetArtwork(int id)
        {
            var artworks = _artworkService.GetArtId(id);
            if (artworks == null || artworks.Count == 0)
            {
                return NotFound();
            }
            return Ok(artworks);
        }

        // GET api/artwork/all
        [HttpGet("all")]
        public IActionResult GetAllArtworks()
        {
            var artworks = _artworkService.GetAllArt();
            return Ok(artworks);
        }

        // DELETE api/artwork/delete/{id}
        [HttpDelete("delete/{id}")]
        public IActionResult DeleteArtwork(int id)
        {
            try
            {
                _artworkService.DeleteArt(id);
                return Ok(new { message = "Artwork deleted successfully!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET api/artwork/featured
        [HttpGet("featured")]
        public IActionResult GetFeaturedArtworks()
        {
            try
            {
                var artworks = _artworkService.GetFeaturedArtworks();
                return Ok(artworks);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        // GET api/artwork/category/{categoryId}
        [HttpGet("category/{categoryId}")]
        public IActionResult GetArtCategoryId(int categoryId)
        {
            var artworks = _artworkService.GetArtCategoryId(categoryId);
            if (artworks == null || artworks.Count == 0)
            {
                return NotFound();
            }
            return Ok(artworks);
        }

        // GET api/artwork/user/{userId}
        [HttpGet("user/{userId}")]
        public IActionResult GetUserArtworks(int userId)
        {
            try
            {
                var artworks = _artworkService.GetUserArt(userId);
                if (artworks == null || artworks.Count == 0)
                {
                    return NotFound(new { message = "No artworks found for this user." });
                }
                return Ok(artworks);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving artworks.", error = ex.Message });
            }
        }
    }

}
