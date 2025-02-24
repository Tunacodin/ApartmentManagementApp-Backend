using Business.Abstract;
using Entities.Concrete;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using Microsoft.Extensions.Logging;
using Core.Utilities.Results;
using Core.Constants;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BuildingsController : ControllerBase
    {
        private readonly IBuildingService _buildingService;
        private readonly ILogger<BuildingsController> _logger;
        private readonly IWebHostEnvironment _environment;

        public BuildingsController(
            IBuildingService buildingService,
            ILogger<BuildingsController> logger,
            IWebHostEnvironment environment)
        {
            _buildingService = buildingService;
            _logger = logger;
            _environment = environment;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var result = await _buildingService.GetAllAsync();
                return result.Success ? Ok(result) : NotFound(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error retrieving buildings: {ex.Message}");
                return StatusCode(500, ApiResponse<List<Building>>.ErrorResult(Messages.UnexpectedError));
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var result = await _buildingService.GetByIdAsync(id);
                return result.Success ? Ok(result) : NotFound(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error retrieving building with ID {id}: {ex.Message}");
                return StatusCode(500, ApiResponse<Building>.ErrorResult(Messages.UnexpectedError));
            }
        }

        [HttpPost]
        public async Task<IActionResult> Add([FromForm] Building building, IFormFile? image)
        {
            try
            {
                if (building == null)
                {
                    return BadRequest(ApiResponse<Building>.ErrorResult("Building data cannot be null"));
                }

                if (image != null)
                {
                    var fileName = $"building_{DateTime.Now.Ticks}{Path.GetExtension(image.FileName)}";
                    var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "buildings");
                    Directory.CreateDirectory(uploadsFolder);
                    var filePath = Path.Combine(uploadsFolder, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await image.CopyToAsync(stream);
                    }

                    building.ImageId = fileName;
                    building.ImageUrl = $"{Request.Scheme}://{Request.Host}/uploads/buildings/{fileName}";
                }

                var result = await _buildingService.AddAsync(building);
                return result.Success ? CreatedAtAction(nameof(GetById), new { id = result.Data.Id }, result) 
                                   : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error adding building: {ex.Message}");
                return StatusCode(500, ApiResponse<Building>.ErrorResult(Messages.UnexpectedError));
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] Building building, IFormFile? image)
        {
            try
            {
                if (building == null || id != building.Id)
                {
                    return BadRequest(ApiResponse<Building>.ErrorResult(Messages.IdMismatch));
                }

                if (image != null)
                {
                    // Delete old image if exists
                    if (!string.IsNullOrEmpty(building.ImageId))
                    {
                        var oldImagePath = Path.Combine(_environment.WebRootPath, "uploads", "buildings", building.ImageId);
                        if (System.IO.File.Exists(oldImagePath))
                        {
                            System.IO.File.Delete(oldImagePath);
                        }
                    }

                    // Save new image
                    var fileName = $"building_{DateTime.Now.Ticks}{Path.GetExtension(image.FileName)}";
                    var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "buildings");
                    Directory.CreateDirectory(uploadsFolder);
                    var filePath = Path.Combine(uploadsFolder, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await image.CopyToAsync(stream);
                    }

                    // Update image info through service
                    await _buildingService.UpdateImageAsync(id, fileName, 
                        $"{Request.Scheme}://{Request.Host}/uploads/buildings/{fileName}");
                }

                var result = await _buildingService.UpdateAsync(building);
                return result.Success ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating building: {ex.Message}");
                return StatusCode(500, ApiResponse<Building>.ErrorResult(Messages.UnexpectedError));
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _buildingService.DeleteAsync(id);
                return result.Success ? Ok(result) : NotFound(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting building with ID {id}: {ex.Message}");
                return StatusCode(500, ApiResponse<bool>.ErrorResult(Messages.UnexpectedError));
            }
        }
    }
}
