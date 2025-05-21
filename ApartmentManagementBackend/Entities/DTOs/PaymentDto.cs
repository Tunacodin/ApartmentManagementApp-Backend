namespace Entities.DTOs
{
    // Temel ödeme DTO'su
    public class PaymentDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserFullName { get; set; }
        public string PaymentType { get; set; }
        public decimal Amount { get; set; }
        public DateTime? PaymentDate { get; set; }
        public DateTime DueDate { get; set; }
        public bool IsPaid { get; set; }
        public string Description { get; set; }
        public int? DelayedDays { get; set; }
        public decimal? DelayPenaltyAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; }
        public string Month { get; set; }
        public string PaymentTypeTurkish { get; set; }
    }

    // Ödeme oluşturma DTO'su
    public class CreatePaymentDto
    {
        public int UserId { get; set; }
        public int? CardInfoId { get; set; }
        public string PaymentType { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime DueDate { get; set; }
        public string? Description { get; set; }
    }

    // Ödeme listeleme DTO'su
    public class PaymentListDto
    {
        public int Id { get; set; }
        public string UserFullName { get; set; } = string.Empty;
        public string PaymentType { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; }
        public DateTime DueDate { get; set; }
        public bool IsPaid { get; set; }
        public string? Description { get; set; }
        public PaymentCardInfoDto? CardInfo { get; set; }
    }

    // Ödeme detay DTO'su
    public class PaymentDetailDto : PaymentListDto
    {
        public string UserEmail { get; set; } = string.Empty;
        public string UserPhoneNumber { get; set; } = string.Empty;
    }

    // Ödeme kart bilgisi DTO'su (Güvenli görüntüleme için)
    public class PaymentCardInfoDto
    {
        public string LastFourDigits { get; set; } = string.Empty;
        public string BankName { get; set; } = string.Empty;
        public string BankLogoUrl { get; set; } = string.Empty;
    }

    public class PaymentRequestDto
    {
        public string PaymentMethod { get; set; }
        public string CardNumber { get; set; }
        public string CardHolderName { get; set; }
        public string ExpiryDate { get; set; }
        public string CVV { get; set; }
        public decimal Amount { get; set; }
    }

    public class PaymentResultDto
    {
        public int PaymentId { get; set; }
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; }
        public string PaymentType { get; set; } = string.Empty;
        public bool IsSuccessful { get; set; }
        public int? DelayedDays { get; set; }
        public decimal? DelayPenaltyAmount { get; set; }
        public decimal TotalAmount { get; set; }
    }
}