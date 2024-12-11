using Entities.Concrete;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Abstract
{
    public interface IApartmentDal
    {
        List<Apartment> GetAll();

        void Add(Apartment apartment);

        void Update (Apartment apartment);

        void Delete(Apartment apartment);

        
    }
}
