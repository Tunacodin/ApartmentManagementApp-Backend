using Business.Abstract;
using DataAccess.Abstract;
using Entities.Concrete;

namespace Business.Concrete
{
    public class MeetingManager : IMeetingService
    {
        private readonly IMeetingDal _meetingDal;

        public MeetingManager(IMeetingDal meetingDal)
        {
            _meetingDal = meetingDal;
        }

        public void Add(Meeting meeting)
        {
            meeting.CreatedAt = DateTime.Now;
            _meetingDal.Add(meeting);
        }

        public void Update(Meeting meeting)
        {
            _meetingDal.Update(meeting);
        }

        public void Delete(int id)
        {
            var meeting = _meetingDal.Get(m => m.Id == id);
            if (meeting != null)
                _meetingDal.Delete(meeting);
        }

        public List<Meeting> GetAll()
        {
            return _meetingDal.GetAll();
        }

        public List<Meeting> GetByBuildingId(int buildingId)
        {
            return _meetingDal.GetAll(m => m.BuildingId == buildingId);
        }

        public List<Meeting> GetUpcoming()
        {
            return _meetingDal.GetAll(m => m.MeetingDate > DateTime.Now);
        }

        public void CancelMeeting(int meetingId, string reason)
        {
            var meeting = _meetingDal.Get(m => m.Id == meetingId);
            if (meeting != null)
            {
                meeting.IsCancelled = true;
                meeting.CancellationReason = reason;
                _meetingDal.Update(meeting);
            }
        }
    }
} 