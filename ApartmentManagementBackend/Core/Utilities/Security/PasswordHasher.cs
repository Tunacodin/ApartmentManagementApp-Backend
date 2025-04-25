using System.Security.Cryptography;
using System.Text;

namespace Core.Utilities.Security
{
    public class PasswordHasher : IPasswordHasher
    {
        public string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(hashedBytes);
            }
        }

        public PasswordVerificationResult VerifyHashedPassword(string hashedPassword, string providedPassword)
        {
            try
            {
                var hashedProvidedPassword = HashPassword(providedPassword);
                return string.Equals(hashedPassword, hashedProvidedPassword, StringComparison.OrdinalIgnoreCase)
                    ? PasswordVerificationResult.Success
                    : PasswordVerificationResult.Failed;
            }
            catch
            {
                return PasswordVerificationResult.Failed;
            }
        }
    }
}