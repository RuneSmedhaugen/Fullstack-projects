using System.Data;
using System.Data.SqlClient;
using System.Security.Cryptography;
using System.Text;
using VisionHub.Models;

namespace VisionHub.Services
{
    public class UserService : BaseService
    {
        public UserService(string connectionstring) : base(connectionstring)
        {
        }

        public void AddUser(string Username, string Email, string Name, string Password, string Biography, DateTime Birthdate)
        {
            // Generate salt and hash password
            string salt = GenerateSalt();
            string passwordHash = HashPassword(Password, salt);

            string query =
                "INSERT INTO Users (Username, Email, Name, PasswordHash, Salt, Biography, Birthdate, RegisterDate) VALUES (@Username, @Email, @Name, @PasswordHash, @Salt, @Biography, @Birthdate, @RegisterDate)";

            var parameters = new[]
            {
                new SqlParameter("@Username", Username),
                new SqlParameter("@Name", Name),
                new SqlParameter("@Email", Email),
                new SqlParameter("@PasswordHash", passwordHash),
                new SqlParameter("@Salt", salt),
                new SqlParameter("@Biography", Biography ?? (object)DBNull.Value), 
                new SqlParameter("@Birthdate", Birthdate),
                new SqlParameter("@RegisterDate", DateTime.Now)
            };

            ExecuteNonQuery(query, parameters);
        }


        public void RemoveUser(int UserID)
        {
            string query = "DELETE FROM Users WHERE UserID = @UserID";
            var parameters = new[]
            {
                new SqlParameter("@UserID", UserID)
            };
            ExecuteNonQuery(query, parameters);
        }

        public void UpdateUser(int UserID, string newUsername, string newName, string newEmail, string NewPassword, string newBiography, DateTime newBirthdate)
        {
            string salt = GenerateSalt();
            string passwordHash = HashPassword(NewPassword, salt);
            string query = "UPDATE Users SET Username = @Username, Name = @Name, Email = @Email, PasswordHash = @PasswordHash, Biography = @Biography, Birthdate = @Birthdate WHERE UserID = @UserID";
            var parameters = new[]
            {
                new SqlParameter("@UserID", UserID),
                new SqlParameter("@Username", newUsername),
                new SqlParameter("@Name", newName),
                new SqlParameter("@Email", newEmail),
                new SqlParameter("@PasswordHash", passwordHash),
                new SqlParameter("@Salt", salt),
                new SqlParameter("@Biography", newBiography),
                new SqlParameter("@Birthdate", newBirthdate)
            };
            ExecuteNonQuery(query, parameters);
        }

        public List<Users> GetUserInfo(int userID)
        {
            string query = "SELECT * FROM Users WHERE UserID = @UserID";
            var parameters = new[]
            {
                new SqlParameter("@UserID", userID),
            };
            DataTable dataTable = ExecuteQuery(query, parameters);
            return ConvertDataTableToUserList(dataTable);
        }

        public Users ValidateUser(string username, string password)
        {
            string query = "SELECT * FROM Users WHERE Username = @UserName";
            var parameters = new[]
            {
                new SqlParameter("@Username", username)
            };

            DataTable dataTable = ExecuteQuery(query, parameters);
            var userList = ConvertDataTableToUserList(dataTable);

            if (userList.Count == 0) return null;

            var user = userList.First();
            // Verify the password
            if (!VerifyPassword(password, user.PasswordHash, user.Salt))
            {
                return null; // Invalid password
            }

            return user; // Return user object
        }


        public List<Users> GetAllUsers()
        {
            string query = "SELECT * FROM Users";
            DataTable dataTable = ExecuteQuery(query);
            return ConvertDataTableToUserList(dataTable);
        }

        public string HashPassword(string password, string salt)
        {
            using (var sha256 = SHA256.Create())
            {
                var combinedBytes = Encoding.UTF8.GetBytes(password + salt);
                byte[] bytes = sha256.ComputeHash(combinedBytes);
                return Convert.ToBase64String(bytes);
            }
        }

        private string GenerateSalt(int size = 16)
        {
            byte[] saltBytes = new byte[size];
            using (var rng = new RNGCryptoServiceProvider())
            {
                rng.GetBytes(saltBytes);
            }
            return Convert.ToBase64String(saltBytes);
        }

        public bool VerifyPassword(string EnteredPassword, string storedHash, string storedSalt)
        {
            string HashOfInput = HashPassword(EnteredPassword, storedSalt);
            return HashOfInput == storedHash;
        }

        public List<Users> ConvertDataTableToUserList(DataTable dataTable)
        {
            var userList = new List<Users>();

            foreach (DataRow row in dataTable.Rows)
            {
                var user = new Users
                {
                    Id = Convert.ToInt32(row["UserID"]),
                    UserName = row["Username"].ToString(),
                    Email = row["Email"].ToString(),
                    PasswordHash = row["PasswordHash"].ToString(),
                    Biography = row["Biography"].ToString(),
                    BirthDate = Convert.ToDateTime(row["Birthdate"]),
                    Name = row["Name"].ToString(),
                    Salt = row["Salt"].ToString(),
                };

                userList.Add(user);
            }

            return userList;
        }
    }
}
