namespace Core.Utilities.Results
{
    public interface IResult
    {
        bool Success { get; }  // İşlemin başarılı olup olmadığını belirtir
        string Message { get; }  // İşlem sonucu mesajı
    }
}
