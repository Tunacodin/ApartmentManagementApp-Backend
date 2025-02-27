namespace Core.Utilities.Results
{
    public class ApiResponse<T>
    {
        public T? Data { get; set; }
        public bool Success { get; set; }
        public string Message { get; set; }

        private ApiResponse(bool success, string message, T? data)
        {
            Success = success;
            Message = message;
            Data = data;
        }

        public static ApiResponse<T> SuccessResult(string message, T data) 
            => new ApiResponse<T>(true, message, data);

        public static ApiResponse<T> ErrorResult(string message) 
            => new ApiResponse<T>(false, message, default);
    }
}