using Core.DataAccess;
using Entities.Concrete;
using Entities.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using System.Linq.Expressions;

namespace DataAccess.Abstract
{
    public interface ISurveyDal : IEntityRepository<Survey>
    {
        Task<List<SurveyDetailDto>> GetSurveyDetailsAsync(int buildingId);
        Task<SurveyDetailDto> GetSurveyDetailByIdAsync(int surveyId);
        Task<List<SurveyDetailDto>> GetActiveSurveysAsync(int buildingId);
        Task<SurveyStatisticsDto> GetSurveyStatisticsAsync(int surveyId);
        Task<bool> SubmitSurveyResponseAsync(SurveyResponseDto response);
        Task<List<SurveyDetailDto>> GetUserSurveysAsync(int userId);
        Task<List<Survey>> GetListAsync(Expression<Func<Survey, bool>> filter = null);
    }
}