using Entities.DTOs;
using FluentValidation;

namespace Business.ValidationRules.FluentValidation
{
    public class ApartmentDtoValidator : AbstractValidator<ApartmentDto>
    {
        public ApartmentDtoValidator()
        {
            RuleFor(a => a.BuildingId)
                .GreaterThan(0)
                .WithMessage("Geçerli bir bina seçilmelidir");

            RuleFor(a => a.OwnerId)
                .GreaterThan(0)
                .WithMessage("Geçerli bir ev sahibi seçilmelidir");

            RuleFor(a => a.UnitNumber)
                .GreaterThan(0)
                .WithMessage("Daire numarası sıfırdan büyük olmalıdır");

            RuleFor(a => a.Floor)
                .GreaterThanOrEqualTo(-5) // Bodrum katlar için
                .LessThanOrEqualTo(100)   // Makul bir üst sınır
                .WithMessage("Geçerli bir kat numarası girilmelidir (-5 ile 100 arası)");

            RuleFor(a => a.Type)
                .NotEmpty()
                .WithMessage("Daire tipi boş bırakılamaz")
                .MaximumLength(50)
                .WithMessage("Daire tipi 50 karakterden uzun olamaz");

            RuleFor(a => a.RentAmount)
                .GreaterThanOrEqualTo(0)
                .WithMessage("Kira tutarı negatif olamaz");

            RuleFor(a => a.DepositAmount)
                .GreaterThanOrEqualTo(0)
                .WithMessage("Depozito tutarı negatif olamaz");

            RuleFor(a => a.Notes)
                .MaximumLength(500)
                .When(a => !string.IsNullOrEmpty(a.Notes))
                .WithMessage("Notlar 500 karakterden uzun olamaz");
        }
    }
}