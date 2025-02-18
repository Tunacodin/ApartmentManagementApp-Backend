using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using Entities.Concrete;

namespace Business.Abstract
{
    public interface IApartmentService
    {
        void Add(Apartment apartment);
        void Update(Apartment apartment);
        void Delete(int id);
        Apartment? Get(Expression<Func<Apartment, bool>> filter);
        List<Apartment>? GetAll();
        List<Apartment>? GetByBuildingId(int buildingId);
        List<Apartment>? GetByOwnerId(int ownerId);
    }
}