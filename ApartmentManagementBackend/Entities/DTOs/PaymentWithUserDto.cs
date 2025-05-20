using System;

namespace Entities.DTOs
{
    public class PaymentWithUserDto
    {
        public int Id { get; set; }
        public string PaymentType { get; set; }
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; }
        public DateTime DueDate { get; set; }
        public int BuildingId { get; set; }
        public int ApartmentId { get; set; }
        public int UserId { get; set; }
        public bool IsPaid { get; set; }
        public string UserFullName { get; set; }
        public string ProfileImageUrl { get; set; }
        public int? DelayedDays { get; set; }
        public decimal? DelayPenaltyAmount { get; set; }
        public decimal? TotalAmount { get; set; }
        public string Description { get; set; }
        public string Status { get; set; }
    }
}