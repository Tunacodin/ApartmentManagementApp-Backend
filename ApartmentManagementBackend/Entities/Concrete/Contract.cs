using Core.Concrete;
using System;

public class Contract : IEntity
{
    public int Id { get; set; }
    public int TenantId { get; set; }
    public int OwnerId { get; set; }
    public int ApartmentId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal RentAmount { get; set; }
    public string ContractFile { get; set; } = string.Empty;
    public bool IsActive { get; set; }
} 