using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using Business.Abstract;
using DataAccess.Abstract;
using Entities.Concrete;

namespace Business.Concrete
{
    public class ApartmentManager : IApartmentService
    {
        private readonly IApartmentDal _apartmentDal;

        public ApartmentManager(IApartmentDal apartmentDal)
        {
            _apartmentDal = apartmentDal;
        }

        public void Add(Apartment apartment)
        {
            // İş kuralları kontrolü
            if (apartment.RentAmount < 0 || apartment.DepositAmount < 0)
                throw new ArgumentException("Rent and deposit amounts cannot be negative");

            _apartmentDal.Add(apartment);
        }

        public void Update(Apartment apartment)
        {
            _apartmentDal.Update(apartment);
        }

        public void Delete(int id)
        {
            var apartment = _apartmentDal.Get(a => a.Id == id);
            if (apartment != null)
                _apartmentDal.Delete(apartment);
        }

        public Apartment? Get(Expression<Func<Apartment, bool>> filter)
        {
            return _apartmentDal.Get(filter);
        }

        public List<Apartment>? GetAll()
        {
            return _apartmentDal.GetAll();
        }

        public List<Apartment>? GetByBuildingId(int buildingId)
        {
            return _apartmentDal.GetAll(a => a.BuildingId == buildingId);
        }

        public List<Apartment>? GetByOwnerId(int ownerId)
        {
            return _apartmentDal.GetAll(a => a.OwnerId == ownerId);
        }

        // Diğer metodların implementasyonu...
    }
}