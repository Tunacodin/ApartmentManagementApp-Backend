using Business.Concrete;
using DataAccess.Concrete.EntityFramework;
using Entities.Concrete;
using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace ConsoleUI
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Welcome to Apartment Management System!");

            try
            {
                var optionsBuilder = new DbContextOptionsBuilder<ApartmentManagementDbContext>();
                optionsBuilder.UseSqlServer("Server=LAPTOP-0I24A1AJ\\SQLEXPRESS;Database=ApartmentManagement;Trusted_Connection=True;TrustServerCertificate=True;");

                var context = new ApartmentManagementDbContext(optionsBuilder.Options);
                UserManager userManager = new UserManager(new EfUserDal(context));
                MainMenu(userManager);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Fatal Error: {ex.Message}");
                Console.WriteLine("Press any key to exit...");
                Console.ReadKey();
            }
        }

        private static void MainMenu(UserManager userManager)
        {
            while (true)
            {
                try
                {
                    Console.WriteLine("\nSelect an operation:");
                    Console.WriteLine("1. Add User");
                    Console.WriteLine("2. Delete User");
                    Console.WriteLine("3. Update User");
                    Console.WriteLine("4. List Users");
                    Console.WriteLine("5. Exit");
                    Console.Write("Your choice: ");
                    string choice = Console.ReadLine() ?? string.Empty;

                    switch (choice)
                    {
                        case "1": AddUser(userManager); break;
                        case "2": DeleteUser(userManager); break;
                        case "3": UpdateUser(userManager); break;
                        case "4": ListUsers(userManager); break;
                        case "5":
                            Console.WriteLine("Exiting... Goodbye!");
                            return;
                        default:
                            Console.WriteLine("Invalid choice. Please try again.");
                            break;
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error: {ex.Message}");
                }
            }
        }

        private static void AddUser(UserManager userManager)
        {
            try
            {
                var user = new User
                {
                    FirstName = GetUserInput("Enter user name: "),
                    LastName = GetUserInput("Enter user last name: "),
                    Email = GetUserInput("Enter user email: "),
                    PhoneNumber = GetUserInput("Enter user phone number: "),
                    Password = GetUserInput("Enter user password: "),
                    Role = GetUserInput("Enter user role (admin/owner/tenant/security): ").ToLower(),
                    CreatedAt = DateTime.Now,
                    IsActive = true
                };

                ValidateUserInput(user);
                userManager.Add(user);
                Console.WriteLine("User added successfully!");
            }
            catch (Exception ex)
            {
                throw new Exception($"Error adding user: {ex.Message}");
            }
        }

        private static void DeleteUser(UserManager userManager)
        {
            try
            {
                int userId = GetIntInput("Enter user ID to delete: ");
                var user = userManager.Get(u => u.Id == userId);

                if (user == null)
                    throw new Exception("User not found!");

                userManager.Delete(user);
                Console.WriteLine("User deleted successfully!");
            }
            catch (Exception ex)
            {
                throw new Exception($"Error deleting user: {ex.Message}");
            }
        }

        private static void UpdateUser(UserManager userManager)
        {
            try
            {
                int userId = GetIntInput("Enter user ID to update: ");
                var user = userManager.Get(u => u.Id == userId);

                if (user == null)
                    throw new Exception("User not found!");

                UpdateUserProperties(user);
                userManager.Update(user);
                Console.WriteLine("User updated successfully!");
            }
            catch (Exception ex)
            {
                throw new Exception($"Error updating user: {ex.Message}");
            }
        }

        private static void ListUsers(UserManager userManager)
        {
            try
            {
                var users = userManager.GetAll();
                if (users?.Count == 0 || users == null)
                {
                    Console.WriteLine("No users found.");
                    return;
                }

                Console.WriteLine("\nList of Users:");
                foreach (var user in users)
                {
                    Console.WriteLine($"ID: {user.Id}, Name: {user.FirstName} {user.LastName}, " +
                                    $"Email: {user.Email}, Role: {user.Role}, Active: {user.IsActive}");
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Error listing users: {ex.Message}");
            }
        }

        private static string GetUserInput(string prompt)
        {
            Console.Write(prompt);
            return Console.ReadLine()?.Trim() ?? throw new Exception("Input cannot be empty");
        }

        private static int GetIntInput(string prompt)
        {
            Console.Write(prompt);
            if (!int.TryParse(Console.ReadLine(), out int result))
                throw new Exception("Please enter a valid number");
            return result;
        }

        private static void ValidateUserInput(User user)
        {
            if (string.IsNullOrWhiteSpace(user.FirstName))
                throw new Exception("Name cannot be empty");
            if (string.IsNullOrWhiteSpace(user.Email))
                throw new Exception("Email cannot be empty");
            if (!user.Email.Contains("@"))
                throw new Exception("Invalid email format");
            if (string.IsNullOrWhiteSpace(user.Password))
                throw new Exception("Password cannot be empty");
            if (!new[] { "admin", "owner", "tenant", "security" }.Contains(user.Role))
                throw new Exception("Invalid role. Must be admin, owner, tenant, or security");
        }

        private static void UpdateUserProperties(User user)
        {
            string input;

            input = GetUserInput("Enter new name (press Enter to skip): ");
            if (!string.IsNullOrWhiteSpace(input)) user.FirstName = input;

            input = GetUserInput("Enter new last name (press Enter to skip): ");
            if (!string.IsNullOrWhiteSpace(input)) user.LastName = input;

            input = GetUserInput("Enter new email (press Enter to skip): ");
            if (!string.IsNullOrWhiteSpace(input)) user.Email = input;

            input = GetUserInput("Enter new phone number (press Enter to skip): ");
            if (!string.IsNullOrWhiteSpace(input)) user.PhoneNumber = input;

            input = GetUserInput("Enter new password (press Enter to skip): ");
            if (!string.IsNullOrWhiteSpace(input)) user.Password = input;

            input = GetUserInput("Enter new role (press Enter to skip): ");
            if (!string.IsNullOrWhiteSpace(input)) user.Role = input.ToLower();

            ValidateUserInput(user);
        }
    }
}
