using Microsoft.AspNetCore.Mvc;
using Business.Abstract;
using Entities.DTOs;
using Microsoft.Extensions.Logging;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SurveyController : ControllerBase
    {
        private readonly ISurveyService _surveyService;
        private readonly ILogger<SurveyController> _logger;

        public SurveyController(ISurveyService surveyService, ILogger<SurveyController> logger)
        {
            _surveyService = surveyService;
            _logger = logger;
        }

        [HttpGet("building/{buildingId}")]
        public async Task<IActionResult> GetBuildingSurveys(int buildingId)
        {
            try
            {
                _logger.LogInformation("Getting surveys for building {BuildingId}", buildingId);
                var result = await _surveyService.GetSurveyDetailsAsync(buildingId);
                return result.Success ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting building surveys");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                _logger.LogInformation("Getting survey details for ID {SurveyId}", id);
                var result = await _surveyService.GetSurveyDetailAsync(id);
                return result.Success ? Ok(result) : NotFound(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting survey by ID");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("building/{buildingId}/active")]
        public async Task<IActionResult> GetActiveSurveys(int buildingId)
        {
            try
            {
                _logger.LogInformation("Getting active surveys for building {BuildingId}", buildingId);
                var result = await _surveyService.GetActiveSurveysAsync(buildingId);
                return result.Success ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting active surveys");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}/statistics")]
        public async Task<IActionResult> GetStatistics(int id)
        {
            try
            {
                _logger.LogInformation("Getting statistics for survey {SurveyId}", id);
                var result = await _surveyService.GetSurveyStatisticsAsync(id);
                return result.Success ? Ok(result) : NotFound(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting survey statistics");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("submit")]
        public async Task<IActionResult> SubmitResponse([FromBody] SurveyResponseDto response)
        {
            try
            {
                _logger.LogInformation("Submitting response for survey {SurveyId}", response.SurveyId);
                var result = await _surveyService.SubmitSurveyResponseAsync(response);
                return result.Success ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error submitting survey response");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserSurveys(int userId)
        {
            try
            {
                _logger.LogInformation("Getting surveys for user {UserId}", userId);
                var result = await _surveyService.GetUserSurveysAsync(userId);
                return result.Success ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user surveys");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] SurveyCreateDto surveyDto, [FromQuery] int adminId)
        {
            try
            {
                _logger.LogInformation("Creating new survey for building {BuildingId}", surveyDto.BuildingId);
                var result = await _surveyService.CreateSurveyAsync(surveyDto, adminId);
                if (!result.Success || result.Data == null)
                    return BadRequest(result);
                return CreatedAtAction(nameof(GetById), new { id = result.Data.Id }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating survey");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] SurveyUpdateDto surveyDto)
        {
            try
            {
                _logger.LogInformation("Updating survey {SurveyId}", surveyDto.Id);
                var result = await _surveyService.UpdateSurveyAsync(surveyDto);
                return result.Success ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating survey");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                _logger.LogInformation("Deleting survey {SurveyId}", id);
                var result = await _surveyService.DeleteSurveyAsync(id);
                return result.Success ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting survey");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}