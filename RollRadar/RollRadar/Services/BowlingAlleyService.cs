using RollRadar.Models;

namespace RollRadar.Services
{
    public class BowlingAlleyService : BaseService
    {
        public BowlingAlleyService(string connectionString) : base(connectionString)
        {
        }

        public List<BowlingAlleys> GetAllBowlingAlleys()
        {
            var alleys = new List<BowlingAlleys>();
            string query = "SELECT * FROM BowlingAlleys";

            using (var reader = ExecuteReader(query, cmd => { }))
            {
                while (reader.Read())
                {
                    alleys.Add(new BowlingAlleys
                    {
                        Id = reader.GetInt32(0),
                        Name = reader.GetString(1),
                        Location = reader.GetString(2),
                        Comments = reader.GetString(3),
                        Image = reader.GetString(4),
                        UserId = reader.GetInt32(5)
                    });
                }
            }

            return alleys;
        }

        public void AddBowlingAlley(BowlingAlleys alley)
        {
            string query =
                "INSERT INTO BowlingAlleys (Name, Location, Review, Image, UserId) VALUES (@Name, @Location, @Review, @Image, @UserId)";
            ExecuteNonQuery(query, cmd =>
            {
                cmd.Parameters.AddWithValue("@Name", alley.Name);
                cmd.Parameters.AddWithValue("@Location", alley.Location);
                cmd.Parameters.AddWithValue("@Review", alley.Comments);
                cmd.Parameters.AddWithValue("@Image", alley.Image);
                cmd.Parameters.AddWithValue("@UserId", alley.UserId);
            });
        }

        public void EditBowlingAlley(BowlingAlleys alley)
        {
            string query =
                "UPDATE BowlingAlleys SET Name = @Name, Location = @Location, Review = @Review, Image = @Image WHERE Id = @Id";
            ExecuteNonQuery(query, cmd =>
            {
                cmd.Parameters.AddWithValue("@Id", alley.Id);
                cmd.Parameters.AddWithValue("@Name", alley.Name);
                cmd.Parameters.AddWithValue("@Location", alley.Location);
                cmd.Parameters.AddWithValue("@Review", alley.Comments);
                cmd.Parameters.AddWithValue("@Image", alley.Image);
            });
        }

        public void DeleteBowlingAlley(int id)
        {
            string query = "DELETE FROM BowlingAlleys WHERE Id = @Id";
            ExecuteNonQuery(query, cmd => cmd.Parameters.AddWithValue("@Id", id));
        }
    }
}
