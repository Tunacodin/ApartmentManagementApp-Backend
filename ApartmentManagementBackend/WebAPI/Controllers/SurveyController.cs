using Microsoft.AspNetCore.Mvc;
using Business.Abstract;
using Entities.DTOs;
using Microsoft.Extensions.Logging;
using System.Linq;
using Core.Utilities.Results;
using Entities.Concrete;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.AspNetCore.Http;

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

        /// <summary>
        /// Yeni bir anket oluşturur
        /// </summary>
        /// <remarks>
        /// Örnek request:
        /// 
        ///     POST /api/Survey?adminId=1
        ///     {
        ///         "title": "Bina Memnuniyet Anketi",
        ///         "description": "2024 yılı bina hizmetleri memnuniyet anketi",
        ///         "startDate": "2024-03-20T00:00:00",
        ///         "endDate": "2024-04-20T00:00:00",
        ///         "buildingIds": [1, 2],
        ///         "questions": [
        ///             {
        ///                 "questionText": "Bina temizliğinden memnun musunuz?",
        ///                 "questionType": 0,
        ///                 "isRequired": true,
        ///                 "options": ["Evet", "Hayır", "Kısmen"]
        ///             },
        ///             {
        ///                 "questionText": "Güvenlik hizmetlerini nasıl değerlendiriyorsunuz?",
        ///                 "questionType": 1,
        ///                 "isRequired": true,
        ///                 "options": ["Çok İyi", "İyi", "Orta", "Kötü", "Çok Kötü"]
        ///             }
        ///         ]
        ///     }
        /// </remarks>
        /// <param name="surveyDto">Anket bilgileri</param>
        /// <param name="adminId">Anketi oluşturan admin ID</param>
        /// <response code="200">Anket başarıyla oluşturuldu</response>
        /// <response code="400">Geçersiz veri veya validasyon hatası</response>
        /// <response code="500">Sunucu hatası</response>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> CreateSurvey([FromBody] SurveyCreateDto surveyDto, [FromQuery] int adminId)
        {
            try
            {
                _logger.LogInformation("Creating survey with {QuestionCount} questions for admin {AdminId}",
                    surveyDto?.Questions?.Count ?? 0, adminId);

                if (surveyDto == null)
                {
                    _logger.LogWarning("Survey creation failed: Survey data is null");
                    return BadRequest(ApiResponse<Survey>.ErrorResult("Anket verisi boş olamaz."));
                }

                if (!ModelState.IsValid)
                {
                    var errors = string.Join(", ", ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage));
                    _logger.LogWarning("Survey creation failed: Validation errors - {Errors}", errors);
                    return BadRequest(ApiResponse<Survey>.ErrorResult($"Validasyon hataları: {errors}"));
                }

                if (surveyDto.BuildingIds == null || !surveyDto.BuildingIds.Any())
                {
                    _logger.LogWarning("Survey creation failed: No buildings selected");
                    return BadRequest(ApiResponse<Survey>.ErrorResult("En az bir bina seçilmelidir."));
                }

                var result = await _surveyService.CreateSurveyAsync(surveyDto, adminId);
                if (result.Success)
                {
                    _logger.LogInformation("Survey created successfully with ID {SurveyId}", result.Data.Id);
                    return Ok(result);
                }

                _logger.LogWarning("Survey creation failed: {ErrorMessage}", result.Message);
                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating surveys for BuildingIds {BuildingIds}",
                    surveyDto?.BuildingIds?.ToArray() ?? Array.Empty<int>());
                return StatusCode(500, ApiResponse<Survey>.ErrorResult("Anket oluşturulurken bir hata oluştu."));
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