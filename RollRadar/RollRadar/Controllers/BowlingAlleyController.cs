using Microsoft.AspNetCore.Mvc;
using RollRadar.Models;
using RollRadar.Services;
using System.Collections.Generic;

namespace RollRadar.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BowlingAlleyController : ControllerBase
    {
        private readonly BowlingAlleyService _bowlingAlleyService;

        public BowlingAlleyController(BowlingAlleyService bowlingAlleyService)
        {
            _bowlingAlleyService = bowlingAlleyService;
        }

        [HttpGet]
        public ActionResult<List<BowlingAlleys>> GetAllBowlingAlleys()
        {
            var alleys = _bowlingAlleyService.GetAllBowlingAlleys();
            return Ok(alleys);
        }

        [HttpPost]
        public ActionResult AddBowlingAlley([FromBody] BowlingAlleys alley)
        {
            _bowlingAlleyService.AddBowlingAlley(alley);
            return Ok("Bowling alley added successfully.");
        }

        [HttpPut("{id}")]
        public ActionResult EditBowlingAlley(int id, [FromBody] BowlingAlleys alley)
        {
            alley.Id = id;
            _bowlingAlleyService.EditBowlingAlley(alley);
            return Ok("Bowling alley updated successfully.");
        }

        [HttpDelete("{id}")]
        public ActionResult DeleteBowlingAlley(int id)
        {
            _bowlingAlleyService.DeleteBowlingAlley(id);
            return Ok("Bowling alley deleted successfully.");
        }
    }
}