using Business.Abstract;
using Core.Constants;
using Core.Utilities.Results;
using DataAccess.Abstract;
using Entities.Concrete;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Business.Concrete
{
    public class CardInfoManager : ICardInfoService
    {
        private readonly ICardInfoDal _cardInfoDal;
        private readonly ILogger<CardInfoManager> _logger;

        public CardInfoManager(ICardInfoDal cardInfoDal, ILogger<CardInfoManager> logger)
        {
            _cardInfoDal = cardInfoDal;
            _logger = logger;
        }

        public async Task<ApiResponse<CardInfo>> AddAsync(CardInfo cardInfo)
        {
            try
            {
                await _cardInfoDal.AddAsync(cardInfo);
                return ApiResponse<CardInfo>.SuccessResult(Messages.Added, cardInfo);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error adding card info: {ex.Message}");
                return ApiResponse<CardInfo>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<CardInfo>> UpdateAsync(CardInfo cardInfo)
        {
            try
            {
                await _cardInfoDal.UpdateAsync(cardInfo);
                return ApiResponse<CardInfo>.SuccessResult(Messages.Updated, cardInfo);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating card info: {ex.Message}");
                return ApiResponse<CardInfo>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<bool>> DeleteAsync(CardInfo cardInfo)
        {
            try
            {
                await _cardInfoDal.DeleteAsync(cardInfo);
                return ApiResponse<bool>.SuccessResult(Messages.Deleted, true);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting card info: {ex.Message}");
                return ApiResponse<bool>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<CardInfo>> GetByIdAsync(int cardId)
        {
            try
            {
                var card = await _cardInfoDal.GetByIdAsync(cardId);
                if (card == null)
                {
                    return ApiResponse<CardInfo>.ErrorResult(Messages.NotFound);
                }
                return ApiResponse<CardInfo>.SuccessResult(Messages.Retrieved, card);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting card info by id: {ex.Message}");
                return ApiResponse<CardInfo>.ErrorResult(Messages.UnexpectedError);
            }
        }

        public async Task<ApiResponse<List<CardInfo>>> GetAllByUserIdAsync(int userId)
        {
            try
            {
                var cards = await _cardInfoDal.GetAllAsync(c => c.UserId == userId);
                if (cards == null || cards.Count == 0)
                {
                    return ApiResponse<List<CardInfo>>.ErrorResult(Messages.NotFound);
                }
                return ApiResponse<List<CardInfo>>.SuccessResult(Messages.Listed, cards);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting card info by user id: {ex.Message}");
                return ApiResponse<List<CardInfo>>.ErrorResult(Messages.UnexpectedError);
            }
        }
    }
}
