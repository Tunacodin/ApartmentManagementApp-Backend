using Core.Concrete;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Entities.Enums;

namespace Entities.Concrete
{
    public class Admin : User
    {
        public Admin()
        {
            Role = UserRole.admin.ToString();
        }
    }
}
