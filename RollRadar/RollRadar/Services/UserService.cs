using RollRadar.Models;

namespace RollRadar.Services
{
    public class UserService : BaseService
    {
        public UserService(string connectionString) : base(connectionString)
        {
        }

        public void Register(Users user, string password)
        {
            string query =
                "INSERT INTO Users (Name, Email, PasswordHash, Age, Hand, Image, Comments) VALUES (@Name, @Email, @PasswordHash, @Age, @Hand, @Image, @Comments)";
            ExecuteNonQuery(query, cmd =>
            {
                cmd.Parameters.AddWithValue("@Name", user.Name);
                cmd.Parameters.AddWithValue("@Email", user.Email);
                cmd.Parameters.AddWithValue("@PasswordHash", HashPassword(password));
                cmd.Parameters.AddWithValue("@Age", user.Age);
                cmd.Parameters.AddWithValue("@Hand", user.Hand);
                cmd.Parameters.AddWithValue("@Image", user.Image);
                cmd.Parameters.AddWithValue("@Comments", user.Comments);
            });
        }

        public Users GetByEmail(string email)
        {
            string query = "SELECT * FROM Users WHERE Email = @Email";
            using (var reader = ExecuteReader(query, cmd => cmd.Parameters.AddWithValue("@Email", email)))
            {
                if (reader.Read())
                {
                    return new Users
                    {
                        Id = reader.GetInt32(reader.GetOrdinal("Id")),
                        Name = reader.GetString(reader.GetOrdinal("Name")),
                        Email = reader.GetString(reader.GetOrdinal("Email")),
                        PasswordHash = reader.GetString(reader.GetOrdinal("PasswordHash")),
                        Age = reader.GetInt32(reader.GetOrdinal("Age")),
                        Hand = reader.GetString(reader.GetOrdinal("Hand")),
                        Image = reader["Image"] as string,
                        Comments = reader["Comments"] as string
                    };
                }
            }

            return null;
        }

        public void UpdateUser(Users user)
        {
            string query =
                "UPDATE Users SET Name = @Name, Email = @Email, Age = @Age, Hand = @Hand, Image = @Image, Comments = @Comments WHERE Id = @Id";
            ExecuteNonQuery(query, cmd =>
            {
                cmd.Parameters.AddWithValue("@Id", user.Id);
                cmd.Parameters.AddWithValue("@Name", user.Name);
                cmd.Parameters.AddWithValue("@Email", user.Email);
                cmd.Parameters.AddWithValue("@Age", user.Age);
                cmd.Parameters.AddWithValue("@Hand", user.Hand);
                cmd.Parameters.AddWithValue("@Image", user.Image);
                cmd.Parameters.AddWithValue("@Comments", user.Comments);
            });
        }

        public string HashPassword(string password)
        {
            using (var sha256 = System.Security.Cryptography.SHA256.Create())
            {
                byte[] hashedBytes = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
                return BitConverter.ToString(hashedBytes).Replace("-", "").ToLower();
            }
        }
    }
}
