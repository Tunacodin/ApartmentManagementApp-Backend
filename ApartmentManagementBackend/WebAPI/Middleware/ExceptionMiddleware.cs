using Core.Constants;
using Core.Utilities.Results;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Text.Json;

namespace WebAPI.Middleware
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception error)
            {
                var response = context.Response;
                response.ContentType = "application/json";

                var (statusCode, apiResponse) = error switch
                {
                    ValidationException e => HandleValidationException(e),
                    KeyNotFoundException e => HandleNotFoundException(e),
                    ArgumentException e => HandleArgumentException(e),
                    _ => HandleUnknownError(error)
                };

                response.StatusCode = statusCode;
                await response.WriteAsync(JsonSerializer.Serialize(apiResponse));
            }
        }

        private (int StatusCode, ApiResponse<object>) HandleValidationException(ValidationException exception)
        {
            _logger.LogWarning("Validation error occurred: {Message}", exception.Message);
            var errors = exception.Errors.Select(e => e.ErrorMessage).ToList();
            return (StatusCodes.Status400BadRequest,
                   ApiResponse<object>.ErrorResult(Messages.ValidationFailed, errors));
        }

        private (int StatusCode, ApiResponse<object>) HandleNotFoundException(KeyNotFoundException exception)
        {
            _logger.LogWarning("Not found error occurred: {Message}", exception.Message);
            return (StatusCodes.Status404NotFound,
                   ApiResponse<object>.ErrorResult(Messages.TenantNotFound));
        }

        private (int StatusCode, ApiResponse<object>) HandleArgumentException(ArgumentException exception)
        {
            _logger.LogWarning("Argument error occurred: {Message}", exception.Message);
            return (StatusCodes.Status400BadRequest,
                   ApiResponse<object>.ErrorResult(Messages.ValidationFailed));
        }

        private (int StatusCode, ApiResponse<object>) HandleUnknownError(Exception exception)
        {
            _logger.LogError(exception, "An unexpected error occurred");
            return (StatusCodes.Status500InternalServerError,
                   ApiResponse<object>.ErrorResult(Messages.UnexpectedError));
        }
    }
}