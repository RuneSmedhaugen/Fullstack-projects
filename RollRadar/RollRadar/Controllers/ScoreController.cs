using Microsoft.AspNetCore.Mvc;
using RollRadar.Models;
using RollRadar.Services;
using System.Collections.Generic;

namespace RollRadar.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ScoreController : ControllerBase
    {
        private readonly ScoreService _scoreService;

        public ScoreController(ScoreService scoreService)
        {
            _scoreService = scoreService;
        }

        [HttpGet]
        public ActionResult<List<Scores>> GetAllScores()
        {
            var scores = _scoreService.ViewAllScores();
            return Ok(scores);
        }

        [HttpPost]
        public ActionResult AddScore([FromBody] Scores score)
        {
            _scoreService.AddScore(score);
            return Ok("Score added successfully.");
        }

        [HttpPut("{id}")]
        public ActionResult EditScore(int id, [FromBody] Scores score)
        {
            score.Id = id;
            _scoreService.EditScore(score);
            return Ok("Score updated successfully.");
        }

        [HttpDelete("{id}")]
        public ActionResult DeleteScore(int id)
        {
            _scoreService.DeleteScore(id);
            return Ok("Score deleted successfully.");
        }
    }
}