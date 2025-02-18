using System.Collections.Generic;
using Entities.Concrete;

namespace Business.Abstract
{
    public interface IMeetingService
    {
        void Add(Meeting meeting);
        void Update(Meeting meeting);
        void Delete(int id);
        List<Meeting> GetAll();
        List<Meeting> GetByBuildingId(int buildingId);
        List<Meeting> GetUpcoming();
        void CancelMeeting(int meetingId, string reason);
    }
}