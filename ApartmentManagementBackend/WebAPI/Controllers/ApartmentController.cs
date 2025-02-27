using Microsoft.AspNetCore.Mvc;
using Business.Abstract;
using Entities.Concrete;
using Entities.DTOs;
using Core.Utilities.Results;
using Core.Constants;
using FluentValidation;
using Microsoft.Extensions.Logging;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ApartmentController : ControllerBase
    {
        private readonly IApartmentService _apartmentService;
        private readonly ILogger<ApartmentController> _logger;
        private readonly IValidator<ApartmentDto> _validator;

        public ApartmentController(
            IApartmentService apartmentService,
            ILogger<ApartmentController> logger,
            IValidator<ApartmentDto> validator)
        {
            _apartmentService = apartmentService;
            _logger = logger;
            _validator = validator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var result = await _apartmentService.GetAllAsync();
                if (!result.Success)
                {
                    _logger.LogWarning($"Failed to get apartments: {result.Message}");
                    return NotFound(result);
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting all apartments: {ex.Message}");
                return BadRequest(ApiResponse<List<ApartmentListDto>>.ErrorResult(Messages.UnexpectedError));
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                _logger.LogInformation($"Getting apartment details for ID: {id}");
                var result = await _apartmentService.GetByIdAsync(id);

                if (!result.Success)
                {
                    _logger.LogWarning($"Apartment not found or error occurred for ID {id}: {result.Message}");
                    return NotFound(result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting apartment by id {id}: {ex.Message}");
                return BadRequest(ApiResponse<ApartmentDetailDto>.ErrorResult($"Daire bilgileri getirilirken bir hata oluştu: {ex.Message}"));
            }
        }

        [HttpGet("building/{buildingId}")]
        public async Task<IActionResult> GetByBuildingId(int buildingId)
        {
            try
            {
                var result = await _apartmentService.GetByBuildingIdAsync(buildingId);
                if (!result.Success)
                {
                    _logger.LogWarning($"Failed to get apartments for building {buildingId}: {result.Message}");
                    return NotFound(result);
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting apartments by building id {buildingId}: {ex.Message}");
                return BadRequest(ApiResponse<List<ApartmentListDto>>.ErrorResult(Messages.UnexpectedError));
            }
        }

        [HttpGet("owner/{ownerId}")]
        public async Task<IActionResult> GetByOwnerId(int ownerId)
        {
            try
            {
                var result = await _apartmentService.GetByOwnerIdAsync(ownerId);
                if (!result.Success)
                {
                    _logger.LogWarning($"Failed to get apartments for owner {ownerId}: {result.Message}");
                    return NotFound(result);
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting apartments by owner id {ownerId}: {ex.Message}");
                return BadRequest(ApiResponse<List<ApartmentListDto>>.ErrorResult(Messages.UnexpectedError));
            }
        }

        [HttpPost]
        public async Task<IActionResult> Add([FromBody] ApartmentDto apartmentDto)
        {
            try
            {
                var validationResult = await _validator.ValidateAsync(apartmentDto);
                if (!validationResult.IsValid)
                {
                    var errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                    return BadRequest(ApiResponse<ApartmentDto>.ErrorResult(Messages.ValidationFailed));
                }

                var result = await _apartmentService.AddAsync(apartmentDto);
                if (!result.Success)
                {
                    return BadRequest(result);
                }

                return CreatedAtAction(nameof(GetById), new { id = result.Data.Id }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error adding apartment: {ex.Message}");
                return BadRequest(ApiResponse<ApartmentDto>.ErrorResult(Messages.UnexpectedError));
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ApartmentDto apartmentDto)
        {
            try
            {
                if (id != apartmentDto.Id)
                {
                    return BadRequest(ApiResponse<ApartmentDto>.ErrorResult(Messages.IdMismatch));
                }

                var validationResult = await _validator.ValidateAsync(apartmentDto);
                if (!validationResult.IsValid)
                {
                    var errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                    return BadRequest(ApiResponse<ApartmentDto>.ErrorResult(Messages.ValidationFailed));
                }

                var result = await _apartmentService.UpdateAsync(apartmentDto);
                if (!result.Success)
                {
                    return BadRequest(result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating apartment {id}: {ex.Message}");
                return BadRequest(ApiResponse<ApartmentDto>.ErrorResult(Messages.UnexpectedError));
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _apartmentService.DeleteAsync(id);
                if (!result.Success)
                {
                    return NotFound(result);
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting apartment {id}: {ex.Message}");
                return BadRequest(ApiResponse<bool>.ErrorResult(Messages.UnexpectedError));
            }
        }
    }
}