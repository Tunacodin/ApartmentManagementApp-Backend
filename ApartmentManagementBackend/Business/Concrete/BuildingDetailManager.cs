using Business.Abstract;
using DataAccess.Abstract;
using Entities.Concrete;
using System;
using System.Collections.Generic;

public class BuildingDetailManager : IBuildingDetailService
{
    private readonly IBuildingDetailDal _buildingDetailDal;

    public BuildingDetailManager(IBuildingDetailDal buildingDetailDal)
    {
        _buildingDetailDal = buildingDetailDal;
    }

    public void Add(BuildingDetail buildingDetail)
    {
        if (string.IsNullOrWhiteSpace(buildingDetail.UnitNumber))
        {
            throw new ArgumentException("Unit number cannot be empty.");
        }

        if (buildingDetail.RentAmount <= 0)
        {
            throw new ArgumentException("Rent amount must be greater than 0.");
        }

        _buildingDetailDal.Add(buildingDetail);
    }

    public void Delete(BuildingDetail buildingDetail)
    {
        var existingDetail = _buildingDetailDal.Get(bd => bd.UnitID == buildingDetail.UnitID);
        if (existingDetail == null)
        {
            throw new ArgumentException("Building detail not found.");
        }

        _buildingDetailDal.Delete(buildingDetail);
    }

    public List<BuildingDetail> GetAllByBuildingId(int buildingId)
    {
        return _buildingDetailDal.GetAll(bd => bd.BuildingID == buildingId);
    }

    public BuildingDetail GetById(int unitId)
    {
        var buildingDetail = _buildingDetailDal.Get(bd => bd.UnitID == unitId);
        if (buildingDetail == null)
        {
            throw new ArgumentException("Unit not found.");
        }

        return buildingDetail;
    }

    public void Update(BuildingDetail buildingDetail)
    {
        var existingDetail = _buildingDetailDal.Get(bd => bd.UnitID == buildingDetail.UnitID);
        if (existingDetail == null)
        {
            throw new ArgumentException("Building detail not found.");
        }

        _buildingDetailDal.Update(buildingDetail);
    }
}
