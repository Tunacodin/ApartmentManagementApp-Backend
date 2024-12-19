
using Core.Concrete;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities.Concrete
{
    public class User:IEntity
    {
        public int UserId { get; set; }
        public string Name { get; set; }

        public string Lastname { get; set; }
        public string Password { get; set; }
        public string Email { get; set; }

        public string PhoneNumber { get; set; }

        public string Role { get; set; }

        public DateTime UpdatedAt { get; set; }
        public DateTime CreatedAt { get; set; }


    }
}
