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
                .MinimumLength(5).WithMessage("Ad Soyad en az 5 karakter olmalıdır. Örnek: Ahmet Yılmaz")
                .MaximumLength(50).WithMessage("Ad Soyad en fazla 50 karakter olabilir")
                .Matches(@"^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$").WithMessage("Ad Soyad sadece harflerden oluşmalıdır");

            RuleFor(a => a.Email)
                .NotEmpty().WithMessage("Email boş bırakılamaz")
                .EmailAddress().WithMessage("Geçerli bir email adresi giriniz. Örnek: ornek@email.com")
                .MaximumLength(100).WithMessage("Email adresi en fazla 100 karakter olabilir");

            RuleFor(a => a.PhoneNumber)
                .NotEmpty().WithMessage("Telefon numarası boş bırakılamaz")
                .Matches(@"^(05\d{9})$").WithMessage("Telefon numarası '05' ile başlamalı ve 11 haneli olmalıdır. Örnek: 05351234567");

            RuleFor(a => a.Role)
                .Equal("admin").WithMessage("Rol 'admin' olmalıdır");

            RuleFor(a => a.ProfileImageUrl)
                .Must(BeAValidUrl).When(a => !string.IsNullOrEmpty(a.ProfileImageUrl))
                .WithMessage("Geçerli bir profil resmi URL'i giriniz. Örnek: https://example.com/profile.jpg");

            RuleFor(a => a.Description)
                .MaximumLength(500).When(a => !string.IsNullOrEmpty(a.Description))
                .WithMessage("Açıklama en fazla 500 karakter olabilir");

            RuleFor(a => a.Password)
                .NotEmpty().WithMessage("Şifre boş bırakılamaz")
                .MinimumLength(6).WithMessage("Şifre en az 6 karakter olmalıdır")
                .MaximumLength(100).WithMessage("Şifre en fazla 100 karakter olabilir")
                .Matches(@"[A-Z]").WithMessage("Şifre en az bir büyük harf içermelidir")
                .Matches(@"[a-z]").WithMessage("Şifre en az bir küçük harf içermelidir")
                .Matches(@"[0-9]").WithMessage("Şifre en az bir rakam içermelidir");
        }

        private bool BeAValidUrl(string? url)
        {
            if (string.IsNullOrEmpty(url)) return true;
            return Uri.TryCreate(url, UriKind.Absolute, out _);
        }
    }
}