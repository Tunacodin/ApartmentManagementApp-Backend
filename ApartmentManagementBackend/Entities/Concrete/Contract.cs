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

    // Navigation properties
    public Tenant? Tenant { get; set; }        // 1-1 ilişki: Her sözleşmenin bir kiracısı var
    public Owner? Owner { get; set; }          // 1-1 ilişki: Her sözleşmenin bir ev sahibi var
    public Apartment? Apartment { get; set; }   // 1-1 ilişki: Her sözleşme bir daireye ait
} 