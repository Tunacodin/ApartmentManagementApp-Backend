using Entities.DTOs;
using FluentValidation;

namespace Business.ValidationRules.FluentValidation
{
    public class AdminDtoValidator : AbstractValidator<AdminDto>
    {
        public AdminDtoValidator()
        {
            RuleFor(a => a.FullName)
                .NotEmpty().WithMessage("Ad Soyad boş bırakılamaz")
                .MinimumLength(5).WithMessage("Ad Soyad en az 5 karakter olmalıdır")
                .MaximumLength(50).WithMessage("Ad Soyad en fazla 50 karakter olabilir");

            RuleFor(a => a.Email)
                .NotEmpty().WithMessage("Email boş bırakılamaz")
                .EmailAddress().WithMessage("Geçerli bir email adresi giriniz");

            RuleFor(a => a.PhoneNumber)
                .NotEmpty().WithMessage("Telefon numarası boş bırakılamaz")
                .Matches(@"^\+?[1-9][0-9]{7,14}$").WithMessage("Geçerli bir telefon numarası giriniz");

            RuleFor(a => a.Role)
                .Equal("admin").WithMessage("Rol 'admin' olmalıdır");

            RuleFor(a => a.ProfileImageUrl)
                .Must(BeAValidUrl).When(a => !string.IsNullOrEmpty(a.ProfileImageUrl))
                .WithMessage("Geçerli bir profil resmi URL'i giriniz");

            RuleFor(a => a.Description)
                .MaximumLength(500).When(a => !string.IsNullOrEmpty(a.Description))
                .WithMessage("Açıklama en fazla 500 karakter olabilir");
        }

        private bool BeAValidUrl(string? url)
        {
            if (string.IsNullOrEmpty(url)) return true;
            return Uri.TryCreate(url, UriKind.Absolute, out _);
        }
    }
}