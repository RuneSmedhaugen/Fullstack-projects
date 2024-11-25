using System.Runtime.InteropServices.JavaScript;

namespace RollRadar.Models
{
    public class Scores : BaseModel
    {
        private int _userId;
        private int _totalScore;
        private int _strikes;
        private int _spares;
        private int _holes;
        private int _bowlingAlleyId;
        private DateTime _scoreDate;

        public int UserId
        {
            get => _userId;
            set => _userId = value;
        }

        public int TotalScore
        {
            get => _totalScore;
            set => _totalScore = value;
        }

        public int Strikes
        {
            get => _strikes;
            set => _strikes = value;
        }

        public int Spares
        {
            get => _spares;
            set => _spares = value;
        }

        public int Holes
        {
            get => _holes;
            set => _holes = value;
        }

        public int BowlingAlleyId
        {
            get => _bowlingAlleyId;
            set => _bowlingAlleyId = value;
        }

        public DateTime ScoreDate
        {
            get => _scoreDate;
            set => _scoreDate = value;
        }


        public string BowlingAlleyName { get; set; }

        public Scores(int userId,string name, int totalScore, int strikes, int spares, int holes, DateTime scoreDate, string bowlingAlleyName, string image, string comments) : base(name, image, comments)
        {
            this.UserId = userId;
            this.TotalScore = totalScore;
            this.Strikes = strikes;
            this.Spares = spares;
            this.Holes = holes;
            this.ScoreDate = scoreDate;
            this.BowlingAlleyName = bowlingAlleyName;
        }

        public Scores()
        {
            
        }
    }
}
