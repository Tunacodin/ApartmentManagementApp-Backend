using System;

namespace Entities.DTOs
{
    public class CardInfoDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string CardHolderName { get; set; } = string.Empty;
        public string CardNumber { get; set; } = string.Empty;
        public string ExpirationDate { get; set; } = string.Empty;
        public string CVV { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }
        public string BankName { get; set; } = string.Empty;
        public string BankLogoUrl { get; set; } = string.Empty;
    }

    // Ödeme ile birlikte kart bilgilerini görüntülemek için DTO
    public class PaymentWithCardInfoDto
    {
        public int PaymentId { get; set; }
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; }
        public string PaymentType { get; set; } = string.Empty;
        public bool IsPaid { get; set; }
        public string? Description { get; set; }

        // Kart Bilgileri
        public string? CardNumber { get; set; }        // Son 4 hanesi gösterilecek
        public string? BankName { get; set; }
        public string? BankLogoUrl { get; set; }
    }
}