using System;

namespace Entities.DTOs
{
    public class UserWithApartmentDto
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string ProfileImageUrl { get; set; }
        public string ApartmentNumber { get; set; }
        public string ApartmentBlock { get; set; }
        public string ApartmentType { get; set; }
        public int ApartmentFloor { get; set; }
        public bool IsOwner { get; set; }
    }
}