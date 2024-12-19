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

        public void Add(Building building)
        {
            _buildingDal.Add(building);
        }

        public void Update(Building building)
        {
            _buildingDal.Update(building);
        }

        public void Delete(Building building)
        {
            _buildingDal.Delete(building);
        }

        public Building GetById(int buildingId)
        {
            return _buildingDal.Get(b => b.BuildingId == buildingId);
        }

        public List<Building> GetAll()
        {
            return _buildingDal.GetAll();
        }
    }
}
