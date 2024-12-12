using Business.Concrete;
using DataAccess.Concrete.EntityFramework;
using Entities.Concrete;
using System;

namespace ConsoleUI
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Welcome to Apartment Management System!");

            UserManager userManager = new UserManager(new EfUserDal());

            while (true)
            {
                Console.WriteLine("\nSelect an operation:");
                Console.WriteLine("1. Add User");
                Console.WriteLine("2. Delete User");
                Console.WriteLine("3. Update User");
                Console.WriteLine("4. List Users");
                Console.WriteLine("5. Exit");
                Console.Write("Your choice: ");
                string choice = Console.ReadLine();

                switch (choice)
                {
                    case "1":
                        AddUser(userManager);
                        break;
                    case "2":
                        DeleteUser(userManager);
                        break;
                    case "3":
                        UpdateUser(userManager);
                        break;
                    case "4":
                        ListUsers(userManager);
                        break;
                    case "5":
                        Console.WriteLine("Exiting... Goodbye!");
                        return;
                    default:
                        Console.WriteLine("Invalid choice. Please try again.");
                        break;
                }
            }
        }

        private static void AddUser(UserManager userManager)
        {
            Console.Write("Enter user name: ");
            string name = Console.ReadLine();

            Console.Write("Enter user last name: ");
            string lastName = Console.ReadLine();

            Console.Write("Enter user email: ");
            string email = Console.ReadLine();

            Console.Write("Enter user phone number: ");
            string phoneNumber = Console.ReadLine();

            Console.Write("Enter user password: ");
            string password = Console.ReadLine();

            Console.Write("Enter user role (e.g., Admin, Tenant): ");
            string role = Console.ReadLine();

            userManager.Add(new User
            {
                Name = name,
                Lastname = lastName,
                Email = email,
                PhoneNumber = phoneNumber,
                Password = password,
                Role = role,
                CreatedAt = DateTime.Now
            });

            Console.WriteLine("User added successfully!");
        }

        private static void DeleteUser(UserManager userManager)
        {
            Console.Write("Enter username to delete: ");
            string username = Console.ReadLine();

            Console.Write("Enter password: ");
            string password = Console.ReadLine();

            var user = userManager.Get(u => u.Name == username && u.Password == password);
            if (user != null)
            {
                userManager.Delete(user);
                Console.WriteLine("User deleted successfully!");
            }
            else
            {
                Console.WriteLine("Invalid username or password. User not found!");
            }
        }

        private static void UpdateUser(UserManager userManager)
        {
            Console.Write("Enter user ID to update: ");
            if (int.TryParse(Console.ReadLine(), out int userId))
            {
                var user = userManager.Get(u => u.UserId == userId);
                if (user != null)
                {
                    Console.Write("Enter new name (leave blank to keep current): ");
                    string name = Console.ReadLine();
                    if (!string.IsNullOrEmpty(name)) user.Name = name;

                    Console.Write("Enter new last name (leave blank to keep current): ");
                    string lastName = Console.ReadLine();
                    if (!string.IsNullOrEmpty(lastName)) user.Lastname = lastName;

                    Console.Write("Enter new email (leave blank to keep current): ");
                    string email = Console.ReadLine();
                    if (!string.IsNullOrEmpty(email)) user.Email = email;

                    Console.Write("Enter new phone number (leave blank to keep current): ");
                    string phoneNumber = Console.ReadLine();
                    if (!string.IsNullOrEmpty(phoneNumber)) user.PhoneNumber = phoneNumber;

                    Console.Write("Enter new password (leave blank to keep current): ");
                    string password = Console.ReadLine();
                    if (!string.IsNullOrEmpty(password)) user.Password = password;

                    Console.Write("Enter new role (leave blank to keep current): ");
                    string role = Console.ReadLine();
                    if (!string.IsNullOrEmpty(role)) user.Role = role;

                    userManager.Update(user);
                    Console.WriteLine("User updated successfully!");
                }
                else
                {
                    Console.WriteLine("User not found!");
                }
            }
            else
            {
                Console.WriteLine("Invalid ID. Please enter a valid number.");
            }
        }

        private static void ListUsers(UserManager userManager)
        {
            var users = userManager.GetAll();
            Console.WriteLine("\nList of Users:");
            foreach (var user in users)
            {
                Console.WriteLine($"ID: {user.UserId}, Name: {user.Name} {user.Lastname}, Email: {user.Email}, Phone: {user.PhoneNumber}, Role: {user.Role}, Created At: {user.CreatedAt}");
            }
        }
    }
}
