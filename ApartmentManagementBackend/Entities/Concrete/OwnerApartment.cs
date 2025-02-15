using Core.Concrete;

namespace Entities.Concrete
{
    public class OwnerApartment : IEntity
    {
        public int Id { get; set; }
        public int OwnerId { get; set; }
        public int ApartmentId { get; set; }
        public int AssignedByAdminId { get; set; }  // Hangi admin atadı
        public DateTime StartDate { get; set; }        // Mülkiyet başlangıç tarihi
        public DateTime? EndDate { get; set; }         // Mülkiyet bitiş tarihi (satış durumunda)
        public decimal PurchasePrice { get; set; }     // Satın alma fiyatı
        public string? PurchaseNotes { get; set; }     // Satın alma ile ilgili notlar
        public bool IsActive { get; set; }             // Aktif mülkiyet durumu

        // Navigation properties
        public User? Owner { get; set; }               // Dairenin sahibi
        public Apartment? Apartment { get; set; }      // Sahip olunan daire
        public Admin? AssignedByAdmin { get; set; }  // Atamayı yapan admin
    }
}