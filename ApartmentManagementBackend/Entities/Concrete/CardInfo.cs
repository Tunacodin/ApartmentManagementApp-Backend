using Core.Concrete;
public class CardInfo:IEntity
{
    public int CardId { get; set; } // Primary Key
    public int UserId { get; set; }
    public string CardHolder { get; set; }
    public string CardNumber { get; set; }
    public string ExpirationDate { get; set; }
    public string CVV { get; set; }
    public string BankName { get; set; }
    public string CardType { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

