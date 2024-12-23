using Core.Concrete;

namespace Entities.Concrete
{
    public class BuildingDetail : IEntity
    {
        public int UnitID { get; set; }               // Benzersiz kimlik
        public int BuildingID { get; set; }          // Building tablosu ile ilişki
        public string UnitNumber { get; set; }       // Daire numarası
        public int Floor { get; set; }               // Kat
        public decimal RentAmount { get; set; }      // Kira miktarı
        public decimal DepositAmount { get; set; }   // Depozito miktarı
        public string Type { get; set; }             // Daire tipi (örn. "1+1")
        public bool HasBalcony { get; set; }         // Balkon var mı
        public string Notes { get; set; }            // Notlar
    }
}
