using Entities.DTOs;
using FluentValidation;

namespace Business.ValidationRules.FluentValidation
{
    public class TenantDtoValidator : AbstractValidator<TenantDto>
    {
        public TenantDtoValidator()
        {
            RuleFor(t => t.FullName)
                .NotEmpty().WithMessage("İsim boş bırakılamaz")
                .MaximumLength(100).WithMessage("İsim 100 karakterden uzun olamaz");

            RuleFor(t => t.Email)
                .NotEmpty().WithMessage("Email boş bırakılamaz")
                .EmailAddress().WithMessage("Geçerli bir email adresi gereklidir");

            RuleFor(t => t.PhoneNumber)
                .NotEmpty().WithMessage("Telefon numarası boş bırakılamaz")
                .Matches(@"^\+?[1-9][0-9]{7,14}$").WithMessage("Geçerli bir telefon numarası gereklidir");

            RuleFor(t => t.ApartmentId)
                .GreaterThan(0).WithMessage("Geçerli bir daire seçilmelidir");

            RuleFor(t => t.MonthlyRent)
                .GreaterThan(0).WithMessage("Aylık kira sıfırdan büyük olmalıdır");

            RuleFor(t => t.MonthlyDues)
                .GreaterThan(0).WithMessage("Aylık aidat sıfırdan büyük olmalıdır");

            RuleFor(t => t.LeaseStartDate)
                .NotEmpty().WithMessage("Kira başlangıç tarihi boş bırakılamaz")
                .LessThan(t => t.LeaseEndDate).When(t => t.LeaseEndDate.HasValue)
                .WithMessage("Kira başlangıç tarihi, kira bitiş tarihinden önce olmalıdır");
        }
    }
}