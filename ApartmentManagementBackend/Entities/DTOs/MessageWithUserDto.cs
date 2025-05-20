using System;

namespace Entities.DTOs
{
    public class MessageWithUserDto
    {
        public int Id { get; set; }
        public string Content { get; set; }
        public DateTime CreatedDate { get; set; }
        public string SenderFullName { get; set; }
        public string SenderProfileImageUrl { get; set; }
        public string ReceiverFullName { get; set; }
        public string ReceiverProfileImageUrl { get; set; }
    }
}