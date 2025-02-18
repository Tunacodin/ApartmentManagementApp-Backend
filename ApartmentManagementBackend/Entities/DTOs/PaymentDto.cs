namespace Entities.DTOs
{
    public class PaymentDto
    {
        public int Id { get; set; }
        public string UserFullName { get; set; } = string.Empty;
        public string PaymentType { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; }
        public bool IsPaid { get; set; }
        public string Description { get; set; } = string.Empty;
    }
}