using Business.Abstract;
using DataAccess.Abstract;
using Entities.Concrete;
using System.Linq.Expressions;

namespace Business.Concrete
{
    public class OwnerManager : IOwnerService
    {
        private readonly IOwnerDal _ownerDal;
        private readonly IApartmentDal _apartmentDal;

        public OwnerManager(IOwnerDal ownerDal, IApartmentDal apartmentDal)
        {
            _ownerDal = ownerDal;
            _apartmentDal = apartmentDal;
        }

        public void Add(Owner owner)
        {
            _ownerDal.Add(owner);
        }

        public void Update(Owner owner)
        {
            _ownerDal.Update(owner);
        }

        public void Delete(int id)
        {
            var owner = _ownerDal.Get(o => o.Id == id);
            if (owner != null)
                _ownerDal.Delete(owner);
        }

        public Owner Get(Expression<Func<Owner, bool>> filter)
        {
            return _ownerDal.Get(filter);
        }

        public List<Owner> GetAll()
        {
            return _ownerDal.GetAll();
        }

        public List<Apartment> GetOwnedApartments(int ownerId)
        {
            return _apartmentDal.GetAll(a => a.OwnerId == ownerId);
        }
    }
} 