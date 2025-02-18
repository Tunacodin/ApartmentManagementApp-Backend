using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using Entities.Concrete;

namespace Business.Abstract
{
    public interface IOwnerService
    {
        void Add(Owner owner);
        void Update(Owner owner);
        void Delete(int id);
        Owner Get(Expression<Func<Owner, bool>> filter);
        List<Owner> GetAll();
        List<Apartment> GetOwnedApartments(int ownerId);
    }
}