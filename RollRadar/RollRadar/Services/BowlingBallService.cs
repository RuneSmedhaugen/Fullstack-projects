using RollRadar.Models;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Threading.Tasks;

namespace RollRadar.Services
{
    public class BowlingBallService
    {
        private readonly string _connectionString;

        public BowlingBallService(string connectionString)
        {
            _connectionString = connectionString;
        }

        public async Task<List<BowlingBalls>> GetAllBowlingBalls()
        {
            var bowlingBalls = new List<BowlingBalls>();

            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                string query = @"
                    SELECT b.*, u.Name AS UserName 
                    FROM BowlingBalls b
                    JOIN Users u ON b.UserId = u.Id";

                using (var command = new SqlCommand(query, connection))
                using (var reader = await command.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        BowlingBalls ball = new BowlingBalls
                        {
                            Id = reader.GetInt32(reader.GetOrdinal("Id")),
                            UserId = reader.GetInt32(reader.GetOrdinal("UserId")),
                            Name = reader.GetString(reader.GetOrdinal("Name")),
                            Brand = reader.GetString(reader.GetOrdinal("Brand")),
                            Cost = reader.GetDecimal(reader.GetOrdinal("Cost")),
                            Surface = reader.GetString(reader.GetOrdinal("Surface")),
                            HookPotential = reader.GetInt32(reader.GetOrdinal("HookPotential")),
                            Type = reader.GetString(reader.GetOrdinal("Type")),
                            Image = reader.GetString(reader.GetOrdinal("Image")),
                            Comments = reader.GetString(reader.GetOrdinal("Comments")),
                        };

                        bowlingBalls.Add(ball);
                    }
                }
            }

            return bowlingBalls;
        }

        public async Task AddBowlingBall(BowlingBalls ball, int userId)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                string query = @"
                    INSERT INTO BowlingBalls (Name, Brand, Cost, Surface, HookPotential, Type, Image, Comments, UserId) 
                    VALUES (@Name, @Brand, @Cost, @Surface, @HookPotential, @Type, @Image, @Comments, @UserId)";

                using (var command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@Name", ball.Name);
                    command.Parameters.AddWithValue("@Brand", ball.Brand);
                    command.Parameters.AddWithValue("@Cost", ball.Cost);
                    command.Parameters.AddWithValue("@Surface", ball.Surface);
                    command.Parameters.AddWithValue("@HookPotential", ball.HookPotential);
                    command.Parameters.AddWithValue("@Type", ball.Type);
                    command.Parameters.AddWithValue("@Image", ball.Image);
                    command.Parameters.AddWithValue("@Comments", ball.Comments);
                    command.Parameters.AddWithValue("@UserId", userId);

                    await command.ExecuteNonQueryAsync();
                }
            }
        }

        public async Task UpdateBowlingBall(BowlingBalls ball)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                string query = @"
                    UPDATE BowlingBalls 
                    SET Name = @Name, Brand = @Brand, Cost = @Cost, Surface = @Surface, 
                        HookPotential = @HookPotential, Type = @Type, Image = @Image, Comments = @Comments
                    WHERE Id = @Id AND UserId = @UserId";

                using (var command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@Id", ball.Id);
                    command.Parameters.AddWithValue("@UserId", ball.UserId);
                    command.Parameters.AddWithValue("@Name", ball.Name);
                    command.Parameters.AddWithValue("@Brand", ball.Brand);
                    command.Parameters.AddWithValue("@Cost", ball.Cost);
                    command.Parameters.AddWithValue("@Surface", ball.Surface);
                    command.Parameters.AddWithValue("@HookPotential", ball.HookPotential);
                    command.Parameters.AddWithValue("@Type", ball.Type);
                    command.Parameters.AddWithValue("@Image", ball.Image);
                    command.Parameters.AddWithValue("@Comments", ball.Comments);

                    await command.ExecuteNonQueryAsync();
                }
            }
        }

        public async Task DeleteBowlingBall(int id, int userId)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                string query = "DELETE FROM BowlingBalls WHERE Id = @Id AND UserId = @UserId";

                using (var command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@Id", id);
                    command.Parameters.AddWithValue("@UserId", userId);

                    await command.ExecuteNonQueryAsync();
                }
            }
        }
    }
}
