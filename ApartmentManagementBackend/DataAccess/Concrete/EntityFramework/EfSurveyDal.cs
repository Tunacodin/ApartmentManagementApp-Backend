using Core.DataAccess;
using DataAccess.Abstract;
using Entities.Concrete;
using Entities.DTOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using System.Linq.Expressions;

namespace DataAccess.Concrete.EntityFramework
{
    public class EfSurveyDal : EfEntityRepositoryBase<Survey, ApartmentManagementDbContext>, ISurveyDal
    {
        private readonly ILogger<EfSurveyDal> _logger;

        public EfSurveyDal(ApartmentManagementDbContext context, ILogger<EfSurveyDal> logger) : base(context)
        {
            _logger = logger;
        }

        public async Task<List<SurveyDetailDto>> GetSurveyDetailsAsync(int buildingId)
        {
            try
            {
                _logger.LogInformation("Getting surveys for building {BuildingId}", buildingId);

                // Önce tüm anketleri kontrol et
                var allSurveys = await _context.Surveys.ToListAsync();
                _logger.LogInformation("Total surveys in database: {Count}", allSurveys.Count);

                var buildingSurveys = allSurveys.Where(s => s.BuildingId == buildingId).ToList();
                _logger.LogInformation("Surveys for building {BuildingId}: {Count}", buildingId, buildingSurveys.Count);

                var surveys = await _context.Surveys
                    .Where(s => s.BuildingId == buildingId)
                    .GroupJoin(_context.Buildings,
                        s => s.BuildingId,
                        b => b.Id,
                        (s, b) => new { Survey = s, Buildings = b })
                    .SelectMany(
                        x => x.Buildings.DefaultIfEmpty(),
                        (s, b) => new { Survey = s.Survey, Building = b })
                    .GroupJoin(_context.Users.OfType<Admin>(),
                        s => s.Survey.CreatedByAdminId,
                        a => a.Id,
                        (s, a) => new { s.Survey, s.Building, Admins = a })
                    .SelectMany(
                        x => x.Admins.DefaultIfEmpty(),
                        (s, a) => new
                        {
                            Id = s.Survey.Id,
                            Title = s.Survey.Title,
                            Description = s.Survey.Description,
                            StartDate = s.Survey.StartDate,
                            EndDate = s.Survey.EndDate,
                            IsActive = s.Survey.IsActive,
                            BuildingId = s.Survey.BuildingId,
                            TotalResponses = s.Survey.TotalResponses,
                            CreatedAt = s.Survey.CreatedAt,
                            BuildingName = s.Building == null ? null : s.Building.BuildingName,
                            CreatedByName = a == null ? null : $"{a.FirstName} {a.LastName}",
                            ProfileImageUrl = a != null ? a.ProfileImageUrl : string.Empty,
                            Questions = s.Survey.Questions,
                            Results = s.Survey.Results
                        })
                    .OrderByDescending(s => s.CreatedAt)
                    .ToListAsync();

                return surveys.Select(s => new SurveyDetailDto
                {
                    Id = s.Id,
                    Title = s.Title,
                    Description = s.Description,
                    StartDate = s.StartDate,
                    EndDate = s.EndDate,
                    IsActive = s.IsActive,
                    BuildingId = s.BuildingId,
                    TotalResponses = s.TotalResponses,
                    CreatedAt = s.CreatedAt,
                    BuildingName = s.BuildingName ?? "Bilinmeyen Bina",
                    CreatedByName = s.CreatedByName ?? "Bilinmeyen Admin",
                    ProfileImageUrl = s.ProfileImageUrl ?? string.Empty,
                    Questions = !string.IsNullOrEmpty(s.Questions) ?
                        DeserializeQuestions(s.Questions, s.Id) ?? new List<SurveyQuestionDto>()
                        : new List<SurveyQuestionDto>(),
                    Results = !string.IsNullOrEmpty(s.Results) ?
                        DeserializeResults(s.Results, s.Id) ?? new Dictionary<string, object>()
                        : new Dictionary<string, object>()
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting survey details for building {BuildingId}", buildingId);
                throw;
            }
        }

        public async Task<SurveyDetailDto> GetSurveyDetailByIdAsync(int surveyId)
        {
            try
            {
                var survey = await _context.Surveys
                    .Where(s => s.Id == surveyId)
                    .FirstOrDefaultAsync();

                if (survey == null)
                {
                    _logger.LogWarning("Survey with ID {SurveyId} not found", surveyId);
                    throw new Exception($"Survey with ID {surveyId} not found");
                }

                _logger.LogInformation("Found survey with ID {SurveyId}", surveyId);

                string? buildingName = null;
                string? adminFullName = null;

                try
                {
                    var building = await _context.Buildings
                        .Where(b => b.Id == survey.BuildingId)
                        .Select(b => b.BuildingName)
                        .FirstOrDefaultAsync();
                    buildingName = building;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Error getting building name for BuildingId {BuildingId}", survey.BuildingId);
                }

                try
                {
                    var admin = await _context.Users.OfType<Admin>()
                        .Where(a => a.Id == survey.CreatedByAdminId)
                        .Select(a => new { a.FirstName, a.LastName })
                        .FirstOrDefaultAsync();
                    adminFullName = admin != null ? $"{admin.FirstName ?? ""} {admin.LastName ?? ""}".Trim() : null;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Error getting admin name for AdminId {AdminId}", survey.CreatedByAdminId);
                }

                var surveyDetail = new SurveyDetailDto
                {
                    Id = survey.Id,
                    Title = survey.Title ?? "",
                    Description = survey.Description ?? "",
                    StartDate = survey.StartDate,
                    EndDate = survey.EndDate,
                    IsActive = survey.IsActive,
                    BuildingId = survey.BuildingId,
                    TotalResponses = survey.TotalResponses,
                    CreatedAt = survey.CreatedAt,
                    BuildingName = buildingName ?? "Bilinmeyen Bina",
                    CreatedByName = !string.IsNullOrWhiteSpace(adminFullName) ? adminFullName : "Bilinmeyen Admin",
                    ProfileImageUrl = string.Empty,
                    Questions = !string.IsNullOrEmpty(survey.Questions) ?
                        DeserializeQuestions(survey.Questions, survey.Id) ?? new List<SurveyQuestionDto>()
                        : new List<SurveyQuestionDto>(),
                    Results = !string.IsNullOrEmpty(survey.Results) ?
                        DeserializeResults(survey.Results, survey.Id) ?? new Dictionary<string, object>()
                        : new Dictionary<string, object>()
                };

                return surveyDetail;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting survey detail for ID {SurveyId}", surveyId);
                throw;
            }
        }

        public async Task<List<SurveyDetailDto>> GetActiveSurveysAsync(int buildingId)
        {
            try
            {
                var now = DateTime.Now;
                var surveys = await _context.Surveys
                    .Where(s => s.BuildingId == buildingId &&
                           s.IsActive &&
                           s.StartDate <= now &&
                           s.EndDate >= now)
                    .GroupJoin(_context.Buildings,
                        s => s.BuildingId,
                        b => b.Id,
                        (s, b) => new { Survey = s, Buildings = b })
                    .SelectMany(
                        x => x.Buildings.DefaultIfEmpty(),
                        (s, b) => new { Survey = s.Survey, Building = b })
                    .GroupJoin(_context.Users.OfType<Admin>(),
                        s => s.Survey.CreatedByAdminId,
                        a => a.Id,
                        (s, a) => new { s.Survey, s.Building, Admins = a })
                    .SelectMany(
                        x => x.Admins.DefaultIfEmpty(),
                        (s, a) => new
                        {
                            Id = s.Survey.Id,
                            Title = s.Survey.Title,
                            Description = s.Survey.Description,
                            StartDate = s.Survey.StartDate,
                            EndDate = s.Survey.EndDate,
                            IsActive = s.Survey.IsActive,
                            BuildingId = s.Survey.BuildingId,
                            TotalResponses = s.Survey.TotalResponses,
                            CreatedAt = s.Survey.CreatedAt,
                            BuildingName = s.Building == null ? null : s.Building.BuildingName,
                            CreatedByName = a == null ? null : $"{a.FirstName} {a.LastName}",
                            ProfileImageUrl = a != null ? a.ProfileImageUrl : string.Empty,
                            Questions = s.Survey.Questions,
                            Results = s.Survey.Results
                        })
                    .OrderByDescending(s => s.CreatedAt)
                    .ToListAsync();

                return surveys.Select(s => new SurveyDetailDto
                {
                    Id = s.Id,
                    Title = s.Title,
                    Description = s.Description,
                    StartDate = s.StartDate,
                    EndDate = s.EndDate,
                    IsActive = s.IsActive,
                    BuildingId = s.BuildingId,
                    TotalResponses = s.TotalResponses,
                    CreatedAt = s.CreatedAt,
                    BuildingName = s.BuildingName ?? "Bilinmeyen Bina",
                    CreatedByName = s.CreatedByName ?? "Bilinmeyen Admin",
                    ProfileImageUrl = s.ProfileImageUrl ?? string.Empty,
                    Questions = !string.IsNullOrEmpty(s.Questions) ?
                        DeserializeQuestions(s.Questions, s.Id) ?? new List<SurveyQuestionDto>()
                        : new List<SurveyQuestionDto>(),
                    Results = !string.IsNullOrEmpty(s.Results) ?
                        DeserializeResults(s.Results, s.Id) ?? new Dictionary<string, object>()
                        : new Dictionary<string, object>()
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting active surveys for building {BuildingId}", buildingId);
                throw;
            }
        }

        public async Task<SurveyStatisticsDto> GetSurveyStatisticsAsync(int surveyId)
        {
            try
            {
                var survey = await _context.Surveys.FindAsync(surveyId);
                if (survey == null)
                    throw new Exception($"Survey with ID {surveyId} not found");

                var results = JsonSerializer.Deserialize<Dictionary<string, object>>(survey.Results ?? "{}") ?? new Dictionary<string, object>();
                var questions = JsonSerializer.Deserialize<List<SurveyQuestionDto>>(survey.Questions ?? "[]") ?? new List<SurveyQuestionDto>();

                var statistics = new SurveyStatisticsDto
                {
                    TotalResponses = survey.TotalResponses,
                    CompletionRate = survey.TotalResponses > 0 ?
                        (double)results.Count / survey.TotalResponses : 0,
                    QuestionStatistics = new Dictionary<string, Dictionary<string, int>>(),
                    PopularAnswers = new List<string>(),
                    LastResponseDate = survey.CreatedAt
                };

                // İstatistikleri hesapla
                foreach (var question in questions)
                {
                    if (results.ContainsKey(question.QuestionId))
                    {
                        var answers = results[question.QuestionId] as Dictionary<string, int>;
                        if (answers != null)
                        {
                            statistics.QuestionStatistics[question.QuestionId] = answers;
                            if (answers.Any())
                            {
                                var popularAnswer = answers.OrderByDescending(a => a.Value).First();
                                statistics.PopularAnswers.Add($"{question.QuestionText}: {popularAnswer.Key}");
                            }
                        }
                    }
                }

                return statistics;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting survey statistics for ID {SurveyId}", surveyId);
                throw;
            }
        }

        public async Task<bool> SubmitSurveyResponseAsync(SurveyResponseDto response)
        {
            try
            {
                var survey = await _context.Surveys.FindAsync(response.SurveyId);
                if (survey == null)
                    throw new Exception($"Survey with ID {response.SurveyId} not found");

                var currentResults = JsonSerializer.Deserialize<Dictionary<string, object>>(survey.Results ?? "{}") ?? new Dictionary<string, object>();

                // Yanıtları işle ve sonuçları güncelle
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

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error submitting survey response for SurveyId {SurveyId}, TenantId {TenantId}",
                    response.SurveyId, response.TenantId);
                throw;
            }
        }

        public async Task<List<SurveyDetailDto>> GetUserSurveysAsync(int userId)
        {
            try
            {
                var userBuilding = await _context.Users
                    .Where(u => u.Id == userId)
                    .Join(_context.Apartments,
                        u => ((Tenant)u).ApartmentId,
                        a => a.Id,
                        (u, a) => a.BuildingId)
                    .FirstOrDefaultAsync();

                if (userBuilding == 0)
                    return new List<SurveyDetailDto>();

                return await GetActiveSurveysAsync(userBuilding);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user surveys for UserId {UserId}", userId);
                throw;
            }
        }

        private List<SurveyQuestionDto>? DeserializeQuestions(string questionsJson, int surveyId)
        {
            try
            {
                // Doğrudan SurveyQuestionDto listesi olarak deserialize et
                var questions = JsonSerializer.Deserialize<List<SurveyQuestionDto>>(questionsJson);
                if (questions == null)
                {
                    _logger.LogWarning("Questions deserialized to null for SurveyId {SurveyId}", surveyId);
                    return new List<SurveyQuestionDto>();
                }

                // Her soru için yeni bir QuestionId oluştur
                foreach (var question in questions)
                {
                    if (string.IsNullOrEmpty(question.QuestionId))
                    {
                        question.QuestionId = Guid.NewGuid().ToString();
                    }
                }

                return questions;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error deserializing Questions JSON for SurveyId {SurveyId}", surveyId);
                return new List<SurveyQuestionDto>();
            }
        }

        private Dictionary<string, object>? DeserializeResults(string resultsJson, int surveyId)
        {
            try
            {
                var results = new Dictionary<string, object>();
                var resultsArray = JsonSerializer.Deserialize<List<Dictionary<string, object>>>(resultsJson);

                if (resultsArray != null && resultsArray.Count > 0)
                {
                    var firstResult = resultsArray[0];
                    if (firstResult.ContainsKey("answers"))
                    {
                        var answers = firstResult["answers"] as List<object>;
                        if (answers != null)
                        {
                            var answerCounts = new Dictionary<string, int>();
                            foreach (var answer in answers)
                            {
                                var answerStr = answer.ToString();
                                if (answerCounts.ContainsKey(answerStr))
                                {
                                    answerCounts[answerStr]++;
                                }
                                else
                                {
                                    answerCounts[answerStr] = 1;
                                }
                            }
                            results["answers"] = answerCounts;
                        }
                    }
                }

                return results;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error deserializing Results JSON for SurveyId {SurveyId}", surveyId);
                return new Dictionary<string, object>();
            }
        }

        public async Task<List<Survey>> GetListAsync(Expression<Func<Survey, bool>> filter = null)
        {
            return filter == null
                ? await _context.Surveys.ToListAsync()
                : await _context.Surveys.Where(filter).ToListAsync();
        }
    }
}