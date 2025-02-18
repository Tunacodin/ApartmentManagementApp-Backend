using Entities.Concrete;
using System.Collections.Generic;

namespace Business.Abstract
{
    public interface IBuildingService
    {
        List<Building> GetAll();
        Building GetById(int id);
        void Add(Building building);
        void Update(Building building);
        void Delete(int id);
    }
}
