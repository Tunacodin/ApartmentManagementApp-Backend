using Business.Abstract;
using Entities.Concrete;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using Microsoft.Extensions.Logging;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BuildingsController : ControllerBase
    {
        private readonly IBuildingService _buildingService;
        private readonly ILogger<BuildingsController> _logger;

        public BuildingsController(IBuildingService buildingService, ILogger<BuildingsController> logger)
        {
            _buildingService = buildingService;
            _logger = logger;
        }

        [HttpGet]
        public ActionResult<List<Building>> GetAll()
        {
            try
            {
                var buildings = _buildingService.GetAll();
                if (buildings == null || !buildings.Any())
                {
                    _logger.LogWarning("No buildings found");
                    return NotFound("No buildings found.");
                }
                _logger.LogInformation("Successfully retrieved all buildings");
                return Ok(buildings);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error retrieving buildings: {ex.Message}");
                return StatusCode(500, "An error occurred while retrieving buildings");
            }
        }

        [HttpGet("{id}")]
        public ActionResult<Building> GetById(int id)
        {
            try
            {
                var building = _buildingService.GetById(id);
                if (building == null)
                {
                    _logger.LogWarning($"Building with ID {id} not found");
                    return NotFound($"Building with ID {id} not found");
                }
                _logger.LogInformation($"Successfully retrieved building with ID {id}");
                return Ok(building);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error retrieving building with ID {id}: {ex.Message}");
                return StatusCode(500, "An error occurred while retrieving the building");
            }
        }

        [HttpPost]
        public IActionResult Add([FromBody] Building building)
        {
            try
            {
                if (building == null)
                {
                    _logger.LogWarning("Building data is null");
                    return BadRequest("Building data cannot be null");
                }
                _buildingService.Add(building);
                _logger.LogInformation($"Successfully added new building with ID {building.Id}");
                return Ok("Building added successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error adding building: {ex.Message}");
                return StatusCode(500, "An error occurred while adding the building");
            }
        }

        [HttpPut]
        public IActionResult Update([FromBody] Building building)
        {
            try
            {
                if (building == null)
                {
                    _logger.LogWarning("Building update data is null");
                    return BadRequest("Building data cannot be null");
                }
                _buildingService.Update(building);
                _logger.LogInformation($"Successfully updated building with ID {building.Id}");
                return Ok("Building updated successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating building: {ex.Message}");
                return StatusCode(500, "An error occurred while updating the building");
            }
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            try
            {
                _buildingService.Delete(id);
                _logger.LogInformation($"Successfully deleted building with ID {id}");
                return Ok($"Building with ID {id} deleted successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting building with ID {id}: {ex.Message}");
                return StatusCode(500, "An error occurred while deleting the building");
            }
        }
    }
}
