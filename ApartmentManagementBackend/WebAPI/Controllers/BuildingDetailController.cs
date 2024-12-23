using Microsoft.AspNetCore.Mvc;
using Business.Abstract;
using Entities.Concrete;
using System;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BuildingDetailController : ControllerBase
    {
        private readonly IBuildingDetailService _buildingDetailService;

        public BuildingDetailController(IBuildingDetailService buildingDetailService)
        {
            _buildingDetailService = buildingDetailService;
        }

        [HttpGet]
        public IActionResult GetAll([FromQuery] int buildingId)
        {
            if (buildingId <= 0)
            {
                return BadRequest("Invalid building ID.");
            }

            var buildingDetails = _buildingDetailService.GetAllByBuildingId(buildingId);
            if (buildingDetails == null || buildingDetails.Count == 0)
            {
                return NotFound($"No building details found for Building ID {buildingId}.");
            }
            return Ok(buildingDetails);
        }

        // Get building detail by ID
        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var buildingDetail = _buildingDetailService.GetById(id);
            if (buildingDetail == null)
            {
                return NotFound($"Building detail with ID {id} not found.");
            }
            return Ok(buildingDetail);
        }

        // Add a new building detail
        [HttpPost]
        public IActionResult Add([FromBody] BuildingDetail buildingDetail)
        {
            if (buildingDetail == null)
            {
                return BadRequest("Building detail data is null.");
            }

            // Validate required fields
            if (buildingDetail.BuildingID <= 0 ||
                string.IsNullOrWhiteSpace(buildingDetail.UnitNumber) ||
                string.IsNullOrWhiteSpace(buildingDetail.Type))
            {
                return BadRequest("BuildingID, UnitNumber, and Type are required.");
            }

            try
            {
                _buildingDetailService.Add(buildingDetail);
                return CreatedAtAction(nameof(GetById), new { id = buildingDetail.UnitID }, buildingDetail);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // Delete a building detail
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var buildingDetail = _buildingDetailService.GetById(id);
            if (buildingDetail == null)
            {
                return NotFound($"Building detail with ID {id} not found.");
            }

            try
            {
                _buildingDetailService.Delete(buildingDetail);
                return Ok("Building detail deleted successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // Update a building detail
        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] BuildingDetail buildingDetail)
        {
            if (buildingDetail == null || buildingDetail.UnitID != id)
            {
                return BadRequest("Building detail data is invalid.");
            }

            try
            {
                _buildingDetailService.Update(buildingDetail);
                return Ok("Building detail updated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
