using Entities.Concrete;
using System.Collections.Generic;

namespace Business.Abstract
{
    public interface IBuildingService
    {
        void Add(Building building);
        void Update(Building building);
        void Delete(Building building);
        Building GetById(int buildingId);
        List<Building> GetAll();
    }
}
