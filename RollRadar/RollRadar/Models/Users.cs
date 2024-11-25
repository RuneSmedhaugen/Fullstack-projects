namespace RollRadar.Models
{
    public class Users : BaseModel
    {
        private string _email;
        private string _passwordHash;
        private int? _age;
        private string _hand;

        public string Email
        {
            get => _email;
            set => _email = value;
        }

        public string PasswordHash
        {
            get => _passwordHash;
            set => _passwordHash = value;
        }

        public int? Age
        {
            get => _age;
            set => _age = value;
        }

        public string Hand
        {
            get => _hand;
            set => _hand = value;
        }
        public Users(string name, string email, string passwordHash, int? age, string hand, string image, string comments) : base(name, image, comments)
        {
            this.Email = email;
            this.PasswordHash = passwordHash;
            this.Age = age;
            this.Hand = hand;
        }

        public Users()
        {
            
        }
    }
}

