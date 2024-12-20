using Entities.Concrete;
using System.Collections.Generic;

namespace Business.Abstract
{
    public interface ICardInfoService
    {
        void Add(CardInfo cardInfo);
        void Update(CardInfo cardInfo);
        void Delete(CardInfo cardInfo);
        CardInfo GetById(int cardId);
        List<CardInfo> GetAllByUserId(int userId);
    }
}
