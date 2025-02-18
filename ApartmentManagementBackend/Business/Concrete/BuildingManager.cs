using Business.Abstract;
using DataAccess.Abstract;
using Entities.Concrete;
using System.Collections.Generic;

namespace Business.Concrete
{
    public class BuildingManager : IBuildingService
    {
        private readonly IBuildingDal _buildingDal;

        public BuildingManager(IBuildingDal buildingDal)
        {
            _buildingDal = buildingDal;
        }

        public List<Building> GetAll()
        {
            return _buildingDal.GetAll();
        }

        public Building GetById(int id)
        {
            return _buildingDal.Get(b => b.Id == id);
        }

        public void Add(Building building)
        {
            _buildingDal.Add(building);
        }

        public void Update(Building building)
        {
            _buildingDal.Update(building);
        }

        public void Delete(int id)
        {
            var building = _buildingDal.Get(b => b.Id == id);
            if (building != null)
            {
                _buildingDal.Delete(building);
            }
        }
    }
}
