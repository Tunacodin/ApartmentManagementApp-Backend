using Core.Concrete;

namespace Entities.Concrete
{
    public class Building : IEntity
    {
        public int BuildingId { get; set; }          // Benzersiz kimlik
        public string ApartmentName { get; set; }   // Apartman adı
        public int NumberOfFloors { get; set; }     // Kat sayısı
        public int TotalApartments { get; set; }    // Toplam daire sayısı
        public decimal OccupancyRate { get; set; }  // Doluluk oranı
        public string City { get; set; }            // Şehir
        public string District { get; set; }        // İlçe
        public string Neighborhood { get; set; }    // Mahalle
        public string Street { get; set; }          // Sokak adı
        public string BuildingNumber { get; set; }  // Bina numarası
        public string PostalCode { get; set; }      // Posta kodu
    }
}
