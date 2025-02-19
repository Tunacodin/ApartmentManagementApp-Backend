using Core.Utilities.Results;
using Entities.Concrete;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Business.Abstract
{
    public interface ICardInfoService
    {
        Task<ApiResponse<CardInfo>> AddAsync(CardInfo cardInfo);
        Task<ApiResponse<CardInfo>> UpdateAsync(CardInfo cardInfo);
        Task<ApiResponse<bool>> DeleteAsync(CardInfo cardInfo);
        Task<ApiResponse<CardInfo>> GetByIdAsync(int cardId);
        Task<ApiResponse<List<CardInfo>>> GetAllByUserIdAsync(int userId);
    }
}
