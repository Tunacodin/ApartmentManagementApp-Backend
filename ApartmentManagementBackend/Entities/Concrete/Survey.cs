using Core.Concrete;

using System;
using System.Collections.Generic;

namespace Entities.Concrete
{
    public class Survey : IEntity
    {
        public Survey()
        {
            Title = string.Empty;
            Description = string.Empty;
            Questions = "[]";
            Results = "{}";
        }

        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int CreatedByAdminId { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }
        public int BuildingId { get; set; }
        public int TotalResponses { get; set; }
        public string Questions { get; set; } // JSON formatında saklanacak
        public string Results { get; set; } // JSON formatında saklanacak
    }
}