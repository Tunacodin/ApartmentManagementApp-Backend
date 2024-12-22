using Microsoft.AspNetCore.Mvc;
using Business.Abstract;
using Entities.Concrete;
using System;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BuildingController : ControllerBase
    {
        private readonly IBuildingService _buildingService;

        public BuildingController(IBuildingService buildingService)
        {
            _buildingService = buildingService;
        }

        // Get all buildings
        [HttpGet]
        public IActionResult GetAll()
        {
            var buildings = _buildingService.GetAll();
            if (buildings == null || buildings.Count == 0)
            {
                return NotFound("No buildings found.");
            }
            return Ok(buildings);
        }

        // Get building by ID
        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var building = _buildingService.GetById(id);
            if (building == null)
            {
                return NotFound($"Building with ID {id} not found.");
            }
            return Ok(building);
        }

        // Add a new building
        [HttpPost]
        public IActionResult Add([FromBody] Building building)
        {
            if (building == null)
            {
                return BadRequest("Building data is null.");
            }

            // Validate required fields
            if (string.IsNullOrWhiteSpace(building.ApartmentName) ||
                string.IsNullOrWhiteSpace(building.City) ||
                string.IsNullOrWhiteSpace(building.District))
            {
                return BadRequest("ApartmentName, City, and District are required.");
            }

            try
            {
                _buildingService.Add(building);
                return CreatedAtAction(nameof(GetById), new { id = building.BuildingId }, building);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // Delete a building
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var building = _buildingService.GetById(id);
            if (building == null)
            {
                return NotFound($"Building with ID {id} not found.");
            }

            try
            {
                _buildingService.Delete(building);
                return Ok("Building deleted successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
