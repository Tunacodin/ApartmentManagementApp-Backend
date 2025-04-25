namespace Entities.DTOs
{
    public class PaymentHistoryDto
    {
        public int Id { get; set; }
        public string PaymentType { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; }
        public DateTime DueDate { get; set; }
        public bool IsPaid { get; set; }
        public string Description { get; set; } = string.Empty;
        public int? DelayedDays { get; set; }
        public decimal? DelayPenaltyAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public string UserFullName { get; set; } = string.Empty;
        public string ProfileImageUrl { get; set; } = string.Empty;
    }
}