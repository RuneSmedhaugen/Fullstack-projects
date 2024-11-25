using RollRadar.Models;

namespace RollRadar.Services
{
    public class ScoreService : BaseService
    {
        private readonly Users _currentUser;
        private readonly string _connectionString;

        public ScoreService(string connectionString) : base(connectionString)
        {
            _connectionString = connectionString;
        }

        public void AddScore(Scores score)
        {
            string query =
                "INSERT INTO Scores (UserId, TotalScore, Strikes, Spares, Holes, ScoreDate, Image, Comments, BowlingAlley, Name) " +
                "VALUES (@UserId, @TotalScore, @Strikes, @Spares, @Holes, @ScoreDate, @Image, @Comments, @BowlingAlley, @Name)";
            ExecuteNonQuery(query, cmd =>
            {
                cmd.Parameters.AddWithValue("@UserId", _currentUser.Id);
                cmd.Parameters.AddWithValue("@TotalScore", score.TotalScore);
                cmd.Parameters.AddWithValue("@Strikes", score.Strikes);
                cmd.Parameters.AddWithValue("@Spares", score.Spares);
                cmd.Parameters.AddWithValue("@Holes", score.Holes);
                cmd.Parameters.AddWithValue("@ScoreDate", score.ScoreDate);
                cmd.Parameters.AddWithValue("@Image", score.Image);
                cmd.Parameters.AddWithValue("@Comments", score.Comments);
                cmd.Parameters.AddWithValue("@BowlingAlley", score.BowlingAlleyName);
                cmd.Parameters.AddWithValue("@Name", _currentUser.Name);
            });
        }

        public void EditScore(Scores score)
        {
            string query =
                "UPDATE Scores SET TotalScore = @TotalScore, Strikes = @Strikes, Spares = @Spares, Holes = @Holes, ScoreDate = @ScoreDate, Image = @Image, Comments = @Comments WHERE Id = @Id AND UserId = @UserId";
            ExecuteNonQuery(query, cmd =>
            {
                cmd.Parameters.AddWithValue("@Id", score.Id);
                cmd.Parameters.AddWithValue("@UserId", _currentUser.Id);
                cmd.Parameters.AddWithValue("@TotalScore", score.TotalScore);
                cmd.Parameters.AddWithValue("@Strikes", score.Strikes);
                cmd.Parameters.AddWithValue("@Spares", score.Spares);
                cmd.Parameters.AddWithValue("@Holes", score.Holes);
                cmd.Parameters.AddWithValue("@ScoreDate", score.ScoreDate);
                cmd.Parameters.AddWithValue("@Image", score.Image);
                cmd.Parameters.AddWithValue("@Comments", score.Comments);
            });
        }

        public void DeleteScore(int id)
        {
            string query = "DELETE FROM Scores WHERE Id = @Id AND UserId = @UserId";
            ExecuteNonQuery(query, cmd =>
            {
                cmd.Parameters.AddWithValue("@Id", id);
                cmd.Parameters.AddWithValue("@UserId", _currentUser.Id);
            });
        }

        public List<Scores> ViewAllScores()
        {
            string query = "SELECT * FROM Scores WHERE UserId = @UserId";
            List<Scores> scores = new List<Scores>();

            using (var reader = ExecuteReader(query, cmd => cmd.Parameters.AddWithValue("@UserId", _currentUser.Id)))
            {
                while (reader.Read())
                {
                    scores.Add(new Scores
                    {
                        Id = reader.GetInt32(reader.GetOrdinal("Id")),
                        UserId = reader.GetInt32(reader.GetOrdinal("UserId")),
                        Name = reader.GetString(reader.GetOrdinal("Name")),
                        TotalScore = reader.GetInt32(reader.GetOrdinal("TotalScore")),
                        Strikes = reader.GetInt32(reader.GetOrdinal("Strikes")),
                        Spares = reader.GetInt32(reader.GetOrdinal("Spares")),
                        Holes = reader.GetInt32(reader.GetOrdinal("Holes")),
                        ScoreDate = reader.GetDateTime(reader.GetOrdinal("ScoreDate")),
                        Comments = reader.GetString(reader.GetOrdinal("Comments")),
                        BowlingAlleyName = reader.GetString(reader.GetOrdinal("BowlingAlley"))
                    });
                }
            }

            return scores;
        }
    }
}
