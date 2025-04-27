using Core.Utilities.Results;
using Entities.Concrete;
using Entities.DTOs;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;

namespace Business.Abstract
{
    public interface ISurveyService
    {
        void Add(Survey survey);
        void Update(Survey survey);
        void Delete(int id);
        SurveyDto? GetById(int id);
        List<Survey>? GetAll();
        List<Survey>? GetByBuildingId(int buildingId);
        Survey? Get(Expression<Func<Survey, bool>> filter);
        Task<ApiResponse<List<SurveyDetailDto>>> GetSurveyDetailsAsync(int buildingId);
        Task<ApiResponse<SurveyDetailDto>> GetSurveyDetailAsync(int surveyId);
        Task<ApiResponse<List<SurveyDetailDto>>> GetActiveSurveysAsync(int buildingId);
        Task<ApiResponse<SurveyStatisticsDto>> GetSurveyStatisticsAsync(int surveyId);
        Task<ApiResponse<bool>> SubmitSurveyResponseAsync(SurveyResponseDto response);
        Task<ApiResponse<List<SurveyDetailDto>>> GetUserSurveysAsync(int userId);
        Task<ApiResponse<Survey>> CreateSurveyAsync(SurveyCreateDto surveyDto, int adminId);
        Task<ApiResponse<bool>> UpdateSurveyAsync(SurveyUpdateDto surveyDto);
        Task<ApiResponse<bool>> DeleteSurveyAsync(int surveyId);
        List<SurveyDto> GetActiveSurveysByBuildingId(int buildingId);
        void Add(SurveyDto survey);
        void Update(SurveyDto survey);
        void AddResponse(SurveyResponseDto response);
        List<SurveyDto> GetSurveysByTenantId(int tenantId);
    }
}