using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities.Concrete
{
    public class Building
    {

        public int BuildingId { get; set; }
        public int AdminId { get; set; } // Eğer AdminId kullanılacaksa
        public string AdminUsername { get; set; } // Eğer AdminUsername kullanılacaksa
        public string BuildingName { get; set; }
        public int TotalFloors { get; set; }
        public decimal OccupancyRate { get; set; }
        public string City { get; set; }
        public string District { get; set; }
        public string Street { get; set; }
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }


    }
}
