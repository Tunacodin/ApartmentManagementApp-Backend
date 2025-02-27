public class ContractSummaryDto
{
    public int ContractId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int CurrentMonth { get; set; }
    public int TotalMonths { get; set; }
    public int RemainingMonths { get; set; }
    public bool IsExpiringSoon { get; set; }
    public decimal MonthlyRent { get; set; }
    public decimal TotalContractValue { get; set; }
    public decimal RemainingPayments { get; set; }
    public string ContractStatus { get; set; } = string.Empty;
} 