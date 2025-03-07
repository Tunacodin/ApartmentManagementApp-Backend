﻿using Core.Concrete;
using Entities.Enums;

namespace Entities.Concrete
{
    public class Tenant : User
    {
        public Tenant()
        {
            Role = UserRole.tenant.ToString();
        }

        public int ApartmentId { get; set; }
        public DateTime LeaseStartDate { get; set; }
        public DateTime? LeaseEndDate { get; set; }
        public decimal MonthlyRent { get; set; }
        public decimal MonthlyDues { get; set; }
        public DateTime? LastPaymentDate { get; set; }

        
    }
}
