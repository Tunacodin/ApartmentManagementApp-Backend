using Business.Abstract;
using Core.Constants;
using Core.Utilities.Results;
using DataAccess.Abstract;
using Entities.Concrete;
using Entities.DTOs;
using Entities.Enums;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using System.Linq.Expressions;
using System.Linq;

namespace Business.Concrete
{
    public class SurveyManager : ISurveyService
    {
        private readonly ISurveyDal _surveyDal;
        private readonly ILogger<SurveyManager> _logger;
        private readonly ITenantDal _tenantDal;
        private readonly IApartmentDal _apartmentDal;

        public SurveyManager(ISurveyDal surveyDal, ILogger<SurveyManager> logger, ITenantDal tenantDal, IApartmentDal apartmentDal)
        {
            _surveyDal = surveyDal;
            _logger = logger;
            _tenantDal = tenantDal;
            _apartmentDal = apartmentDal;
        }

        public async Task<ApiResponse<List<SurveyDetailDto>>> GetSurveyDetailsAsync(int buildingId)
        {
            try
            {
                var surveys = await _surveyDal.GetSurveyDetailsAsync(buildingId);
                return ApiResponse<List<SurveyDetailDto>>.SuccessResult(Messages.Success, surveys);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting survey details for building {BuildingId}", buildingId);
                return ApiResponse<List<SurveyDetailDto>>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<SurveyDetailDto>> GetSurveyDetailAsync(int surveyId)
        {
            try
            {
                var survey = await _surveyDal.GetSurveyDetailByIdAsync(surveyId);
                return ApiResponse<SurveyDetailDto>.SuccessResult(Messages.Success, survey);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting survey detail for ID {SurveyId}", surveyId);
                return ApiResponse<SurveyDetailDto>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<List<SurveyDetailDto>>> GetActiveSurveysAsync(int buildingId)
        {
            try
            {
                var surveys = await _surveyDal.GetActiveSurveysAsync(buildingId);
                return ApiResponse<List<SurveyDetailDto>>.SuccessResult(Messages.Success, surveys);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting active surveys for building {BuildingId}", buildingId);
                return ApiResponse<List<SurveyDetailDto>>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<SurveyStatisticsDto>> GetSurveyStatisticsAsync(int surveyId)
        {
            try
            {
                var statistics = await _surveyDal.GetSurveyStatisticsAsync(surveyId);
                return ApiResponse<SurveyStatisticsDto>.SuccessResult(Messages.Success, statistics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting survey statistics for ID {SurveyId}", surveyId);
                return ApiResponse<SurveyStatisticsDto>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<bool>> SubmitSurveyResponseAsync(SurveyResponseDto response)
        {
            try
            {
                var result = await _surveyDal.SubmitSurveyResponseAsync(response);
                return ApiResponse<bool>.SuccessResult(Messages.Success, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error submitting survey response for SurveyId {SurveyId}, TenantId {TenantId}",
                    response.SurveyId, response.TenantId);
                return ApiResponse<bool>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<List<SurveyDetailDto>>> GetUserSurveysAsync(int userId)
        {
            try
            {
                var surveys = await _surveyDal.GetUserSurveysAsync(userId);
                return ApiResponse<List<SurveyDetailDto>>.SuccessResult(Messages.Success, surveys);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user surveys for UserId {UserId}", userId);
                return ApiResponse<List<SurveyDetailDto>>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<Survey>> CreateSurveyAsync(SurveyCreateDto surveyDto, int adminId)
        {
            try
            {
                // Temel validasyonlar
                if (surveyDto.BuildingIds == null || !surveyDto.BuildingIds.Any())
                {
                    return ApiResponse<Survey>.ErrorResult("En az bir bina seçilmelidir.");
                }

                // Soruları doğrula
                if (surveyDto.Questions == null || !surveyDto.Questions.Any())
                {
                    return ApiResponse<Survey>.ErrorResult("En az bir soru eklenmelidir.");
                }

                // Her sorunun gerekli alanlarını kontrol et
                foreach (var question in surveyDto.Questions)
                {
                    if (string.IsNullOrEmpty(question.QuestionText))
                    {
                        return ApiResponse<Survey>.ErrorResult("Soru metni boş olamaz.");
                    }

                    // QuestionType kontrolü
                    if (question.QuestionType < 0)
                    {
                        return ApiResponse<Survey>.ErrorResult("Geçersiz soru tipi.");
                    }

                    // Options kontrolü
                    if (question.Options == null)
                    {
                        question.Options = new List<string>();
                    }
                }

                // Tarih kontrolü
                if (surveyDto.StartDate >= surveyDto.EndDate)
                {
                    return ApiResponse<Survey>.ErrorResult("Başlangıç tarihi bitiş tarihinden sonra olamaz.");
                }

                if (surveyDto.EndDate < DateTime.Now)
                {
                    return ApiResponse<Survey>.ErrorResult("Bitiş tarihi geçmiş bir tarih olamaz.");
                }

                var createdSurveys = new List<Survey>();
                foreach (var buildingId in surveyDto.BuildingIds)
                {
                    var survey = new Survey
                    {
                        Title = surveyDto.Title?.Trim() ?? string.Empty,
                        Description = surveyDto.Description?.Trim() ?? string.Empty,
                        StartDate = surveyDto.StartDate,
                        EndDate = surveyDto.EndDate,
                        BuildingId = buildingId,
                        CreatedByAdminId = adminId,
                        CreatedAt = DateTime.Now,
                        IsActive = true,
                        Questions = JsonSerializer.Serialize(surveyDto.Questions),
                        Results = "{}"
                    };

                    await _surveyDal.AddAsync(survey);
                    createdSurveys.Add(survey);
                }

                return ApiResponse<Survey>.SuccessResult(Messages.Success, createdSurveys.First());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating surveys for BuildingIds {BuildingIds}", string.Join(",", surveyDto.BuildingIds));
                return ApiResponse<Survey>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<bool>> UpdateSurveyAsync(SurveyUpdateDto surveyDto)
        {
            try
            {
                var survey = await _surveyDal.GetByIdAsync(surveyDto.Id);
                if (survey == null)
                    return ApiResponse<bool>.ErrorResult("Survey not found");

                survey.Title = surveyDto.Title ?? survey.Title;
                survey.Description = surveyDto.Description ?? survey.Description;
                survey.EndDate = surveyDto.EndDate;
                survey.IsActive = surveyDto.IsActive;

                if (surveyDto.Questions != null)
                {
                    survey.Questions = JsonSerializer.Serialize(surveyDto.Questions);
                }

                await _surveyDal.UpdateAsync(survey);
                return ApiResponse<bool>.SuccessResult(Messages.Success, true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating survey ID {SurveyId}", surveyDto.Id);
                return ApiResponse<bool>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<bool>> DeleteSurveyAsync(int surveyId)
        {
            try
            {
                var survey = await _surveyDal.GetByIdAsync(surveyId);
                if (survey == null)
                    return ApiResponse<bool>.ErrorResult("Survey not found");

                await _surveyDal.DeleteAsync(survey);
                return ApiResponse<bool>.SuccessResult(Messages.Success, true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting survey ID {SurveyId}", surveyId);
                return ApiResponse<bool>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public List<SurveyDto> GetActiveSurveysByBuildingId(int buildingId)
        {
            try
            {
                var surveys = _surveyDal.GetAll(s => s.BuildingId == buildingId && s.IsActive);
                return surveys.Select(s => new SurveyDto
                {
                    Id = s.Id,
                    Title = s.Title,
                    Description = s.Description,
                    StartDate = s.StartDate,
                    EndDate = s.EndDate,
                    Status = s.IsActive ? (int)SurveyStatus.Active : (int)SurveyStatus.Cancelled,
                    BuildingId = s.BuildingId,
                    TotalResponses = s.TotalResponses
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting active surveys for building {BuildingId}", buildingId);
                return new List<SurveyDto>();
            }
        }

        public SurveyDto GetById(int id)
        {
            try
            {
                var survey = _surveyDal.Get(s => s.Id == id);
                if (survey == null)
                    return null;

                return new SurveyDto
                {
                    Id = survey.Id,
                    Title = survey.Title,
                    Description = survey.Description,
                    StartDate = survey.StartDate,
                    EndDate = survey.EndDate,
                    Status = survey.IsActive ? (int)SurveyStatus.Active : (int)SurveyStatus.Cancelled,
                    BuildingId = survey.BuildingId,
                    TotalResponses = survey.TotalResponses
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting survey by ID {SurveyId}", id);
                return null;
            }
        }

        public void Add(SurveyDto surveyDto)
        {
            try
            {
                var survey = new Survey
                {
                    Title = surveyDto.Title,
                    Description = surveyDto.Description,
                    StartDate = surveyDto.StartDate,
                    EndDate = surveyDto.EndDate,
                    IsActive = surveyDto.Status == (int)SurveyStatus.Active,
                    BuildingId = surveyDto.BuildingId,
                    TotalResponses = 0,
                    Questions = "[]",
                    Results = "{}",
                    CreatedAt = DateTime.Now
                };

                _surveyDal.Add(survey);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding survey");
                throw;
            }
        }

        public void Update(SurveyDto surveyDto)
        {
            try
            {
                var survey = _surveyDal.Get(s => s.Id == surveyDto.Id);
                if (survey == null)
                    throw new KeyNotFoundException($"Survey with ID {surveyDto.Id} not found");

                survey.Title = surveyDto.Title;
                survey.Description = surveyDto.Description;
                survey.StartDate = surveyDto.StartDate;
                survey.EndDate = surveyDto.EndDate;
                survey.IsActive = surveyDto.Status == (int)SurveyStatus.Active;
                survey.BuildingId = surveyDto.BuildingId;

                _surveyDal.Update(survey);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating survey");
                throw;
            }
        }

        public void Delete(int id)
        {
            try
            {
                var survey = _surveyDal.Get(s => s.Id == id);
                if (survey != null)
                    _surveyDal.Delete(survey);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting survey");
                throw;
            }
        }

        public void AddResponse(SurveyResponseDto response)
        {
            try
            {
                var survey = _surveyDal.Get(s => s.Id == response.SurveyId);
                if (survey == null)
                    throw new KeyNotFoundException($"Survey with ID {response.SurveyId} not found");

                var currentResults = JsonSerializer.Deserialize<Dictionary<string, object>>(survey.Results ?? "{}") ?? new Dictionary<string, object>();

                foreach (var answer in response.Answers)
                {
                    if (!currentResults.ContainsKey(answer.Key))
                    {
                        currentResults[answer.Key] = new Dictionary<string, int>();
                    }

                    var questionResults = currentResults[answer.Key] as Dictionary<string, int>;
                    var answerValue = answer.Value?.ToString() ?? "null";

                    if (questionResults == null)
                    {
                        questionResults = new Dictionary<string, int>();
                        currentResults[answer.Key] = questionResults;
                    }

                    if (questionResults.ContainsKey(answerValue))
                        questionResults[answerValue]++;
                    else
                        questionResults[answerValue] = 1;
                }

                survey.Results = JsonSerializer.Serialize(currentResults);
                survey.TotalResponses++;

                _surveyDal.Update(survey);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding survey response");
                throw;
            }
        }

        public void Add(Survey survey)
        {
            try
            {
                survey.CreatedAt = DateTime.Now;
                _surveyDal.Add(survey);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding survey");
                throw;
            }
        }

        public void Update(Survey survey)
        {
            try
            {
                _surveyDal.Update(survey);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating survey");
                throw;
            }
        }

        public List<Survey>? GetAll()
        {
            try
            {
                return _surveyDal.GetAll();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all surveys");
                return null;
            }
        }

        public List<Survey>? GetByBuildingId(int buildingId)
        {
            try
            {
                return _surveyDal.GetAll(s => s.BuildingId == buildingId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting surveys by building ID");
                return null;
            }
        }

        public Survey? Get(Expression<Func<Survey, bool>> filter)
        {
            try
            {
                return _surveyDal.Get(filter);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting survey by filter");
                return null;
            }
        }

        public List<SurveyDto> GetSurveysByTenantId(int tenantId)
        {
            try
            {
                var tenant = _tenantDal.Get(t => t.Id == tenantId);
                if (tenant == null)
                    return new List<SurveyDto>();

                var apartment = _apartmentDal.Get(a => a.Id == tenant.ApartmentId);
                if (apartment == null)
                    return new List<SurveyDto>();

                var surveys = _surveyDal.GetAll(s => s.BuildingId == apartment.BuildingId && s.IsActive);
                return surveys.Select(s => new SurveyDto
                {
                    Id = s.Id,
                    Title = s.Title,
                    Description = s.Description,
                    StartDate = s.StartDate,
                    EndDate = s.EndDate,
                    Status = s.IsActive ? (int)SurveyStatus.Active : (int)SurveyStatus.Cancelled,
                    BuildingId = s.BuildingId,
                    TotalResponses = s.TotalResponses,
                    CreatedAt = s.CreatedAt
                }).OrderByDescending(s => s.CreatedAt).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting surveys by tenant ID");
                return new List<SurveyDto>();
            }
        }
    }
}