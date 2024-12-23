using Entities.Concrete;
using System.Collections.Generic;

namespace Business.Abstract
{
    public interface IBuildingDetailService
    {
        void Add(BuildingDetail buildingDetail); // Doğru parametre türü kullanılmalı
        void Update(BuildingDetail buildingDetail);
        void Delete(BuildingDetail buildingDetail);
        BuildingDetail GetById(int apartmentId); // ApartmentID ile detay getir
        List<BuildingDetail> GetAllByBuildingId(int buildingId); // Bir bina içindeki tüm detaylar

    }
}
