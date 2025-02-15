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

        // Navigation properties
        public List<Building> Buildings { get; set; } = new List<Building>();
        public List<Meeting> CreatedMeetings { get; set; } = new List<Meeting>();
        public List<OwnerApartment> AssignedApartments { get; set; } = new List<OwnerApartment>();
        public List<Notification> CreatedNotifications { get; set; } = new List<Notification>();
        public List<Complaint> ResolvedComplaints { get; set; } = new List<Complaint>();
    }
}
