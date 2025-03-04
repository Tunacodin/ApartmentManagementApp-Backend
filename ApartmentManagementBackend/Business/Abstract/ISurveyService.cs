using Core.Utilities.Results;
using Entities.Concrete;
using Entities.DTOs;

namespace Business.Abstract
{
    public interface ISurveyService
    {
        Task<ApiResponse<List<SurveyDetailDto>>> GetSurveyDetailsAsync(int buildingId);
        Task<ApiResponse<SurveyDetailDto>> GetSurveyDetailAsync(int surveyId);
        Task<ApiResponse<List<SurveyDetailDto>>> GetActiveSurveysAsync(int buildingId);
        Task<ApiResponse<SurveyStatisticsDto>> GetSurveyStatisticsAsync(int surveyId);
        Task<ApiResponse<bool>> SubmitSurveyResponseAsync(SurveyResponseDto response);
        Task<ApiResponse<List<SurveyDetailDto>>> GetUserSurveysAsync(int userId);
        Task<ApiResponse<Survey>> CreateSurveyAsync(SurveyCreateDto surveyDto, int adminId);
        Task<ApiResponse<bool>> UpdateSurveyAsync(SurveyUpdateDto surveyDto);
        Task<ApiResponse<bool>> DeleteSurveyAsync(int surveyId);
    }
}