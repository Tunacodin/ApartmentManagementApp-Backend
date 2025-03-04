using Business.Abstract;
using Core.Constants;
using Core.Utilities.Results;
using DataAccess.Abstract;
using Entities.Concrete;
using Entities.DTOs;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace Business.Concrete
{
    public class SurveyManager : ISurveyService
    {
        private readonly ISurveyDal _surveyDal;
        private readonly ILogger<SurveyManager> _logger;

        public SurveyManager(ISurveyDal surveyDal, ILogger<SurveyManager> logger)
        {
            _surveyDal = surveyDal;
            _logger = logger;
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
                _logger.LogError(ex, "Error submitting survey response for SurveyId {SurveyId}, UserId {UserId}",
                    response.SurveyId, response.UserId);
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
                var survey = new Survey
                {
                    Title = surveyDto.Title,
                    Description = surveyDto.Description,
                    StartDate = surveyDto.StartDate,
                    EndDate = surveyDto.EndDate,
                    BuildingId = surveyDto.BuildingId,
                    CreatedByAdminId = adminId,
                    CreatedAt = DateTime.Now,
                    IsActive = true,
                    Questions = JsonSerializer.Serialize(surveyDto.Questions),
                    Results = "{}"
                };

                await _surveyDal.AddAsync(survey);
                return ApiResponse<Survey>.SuccessResult(Messages.Success, survey);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating survey for BuildingId {BuildingId}", surveyDto.BuildingId);
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
                survey.EndDate = surveyDto.EndDate ?? survey.EndDate;
                survey.IsActive = surveyDto.IsActive ?? survey.IsActive;

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
    }
}