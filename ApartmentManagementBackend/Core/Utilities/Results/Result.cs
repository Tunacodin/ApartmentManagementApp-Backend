namespace Core.Utilities.Results
{
    public class Result : IResult
    {
        public bool Success { get; }  // İşlemin başarılı olup olmadığı bilgisi
        public string Message { get; }  // İşlem sonucu mesajı

        // Constructor
        public Result(bool success, string message)
        {
            Success = success;
            Message = message;
        }

        // Eğer sadece Success bilgisi verilirse
        public Result(bool success)
        {
            Success = success;
            Message = success ? "Operation successful." : "Operation failed.";
        }
    }
}
