using System;
using System.Collections.Generic;

namespace Entities.DTOs
{
    public class UserWithComplaintsDto
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string ProfileImageUrl { get; set; }
        public List<ComplaintDto> Complaints { get; set; }
    }
}