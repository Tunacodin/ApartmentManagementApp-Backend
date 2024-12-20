using Business.Abstract;
using DataAccess.Abstract;
using Entities.Concrete;
using System.Collections.Generic;

namespace Business.Concrete
{
    public class CardInfoManager : ICardInfoService
    {
        private readonly ICardInfoDal _cardInfoDal;

        public CardInfoManager(ICardInfoDal cardInfoDal)
        {
            _cardInfoDal = cardInfoDal;
        }

        public void Add(CardInfo cardInfo)
        {
            _cardInfoDal.Add(cardInfo);
        }

        public void Update(CardInfo cardInfo)
        {
            _cardInfoDal.Update(cardInfo);
        }

        public void Delete(CardInfo cardInfo)
        {
            _cardInfoDal.Delete(cardInfo);
        }

        public CardInfo GetById(int cardId)
        {
            return _cardInfoDal.Get(c => c.CardId == cardId);
        }

        public List<CardInfo> GetAllByUserId(int userId)
        {
            return _cardInfoDal.GetAll(c => c.UserId == userId);
        }
    }
}
