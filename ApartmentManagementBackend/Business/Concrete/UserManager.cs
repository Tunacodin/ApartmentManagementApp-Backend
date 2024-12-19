using Business.Abstract;
using Entities.Concrete;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Net.Mail;
using System.Net;

namespace Business.Concrete
{
    public class UserManager : IUserService
    {
        private readonly IUserDal _userDal;

        public UserManager(IUserDal userDal)
        {
            _userDal = userDal;
        }

        public void Add(User user)
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user));

            _userDal.Add(user);
        }

        public void Delete(User user)
        {
            if (user == null) // <= yerine Guid.Empty kontrolü
                throw new ArgumentException("Invalid user.");

            _userDal.Delete(user);
        }

        public string GeneratePasswordResetToken(string email)
        {

            var user = _userDal.Get(u => u.Email == email);
            
            if (user == null)
            {
                throw new Exception("User not found.");
            }

            // Basit bir token için:
            return Guid.NewGuid().ToString();
        }

        public User Get(Expression<Func<User, bool>> filter)
        {
            return _userDal.Get(filter);
        }

        public List<User> GetAll(Expression<Func<User, bool>> filter = null)
        {
            return _userDal.GetAll(filter);
        }

        public void SendPasswordResetEmail(string email, string resetToken)
        {
            // SMTP yapılandırması
            var smtpClient = new SmtpClient("smtp.example.com")
            {
                Port = 587,
                Credentials = new NetworkCredential("your_email@example.com", "your_password"),
                EnableSsl = true,
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress("your_email@example.com"),
                Subject = "Password Reset",
                Body = $"Your password reset token is: {resetToken}",
                IsBodyHtml = true,
            };

            mailMessage.To.Add(email);

            smtpClient.Send(mailMessage);
        }

        public void Update(User user)
        {
            if (user == null ) // <= yerine Guid.Empty kontrolü
                throw new ArgumentException("Invalid user.");

            _userDal.Update(user);
        }

        public User ValidateCredentials(string email, string password)
        {
            var user = _userDal.Get(u => u.Email == email);
            if (user != null && user.Password == password) // Şifreyi hash ile karşılaştırmak önerilir.
            {
                return user;
            }
            return null;
        }
    }
}
