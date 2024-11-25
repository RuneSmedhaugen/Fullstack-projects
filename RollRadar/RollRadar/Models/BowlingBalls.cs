using System.Runtime.CompilerServices;
using AppDomainSetup = System.AppDomainSetup;

namespace RollRadar.Models
{
    public class BowlingBalls : BaseModel
    {
        private string _brand;
        private decimal? _cost;
        private string _surface;
        private int _hookPotential;
        private string _type;
        private int _userId;

        public  string Brand { get => _brand;
            set => _brand = value;
        }
        public decimal? Cost { get => _cost;
            set => _cost = value;
        }
        public  string Surface { get => _surface;
            set => _surface = value;
        }
        public  int HookPotential { get => _hookPotential;
            set => _hookPotential = value;
        }
        public  string Type { get => _type;
            set => _type = value;
        }

        public int UserId
        {
            get => _userId;
            set => _userId = value;
        }

        public BowlingBalls(string brand, decimal? cost, string surface, int hookPotential, string type, string name, string image, string comments, int userId) : base(name, image, comments)
        {
            Cost = cost;
            Brand = brand;
            Surface = surface;
            Type = type;
            HookPotential = hookPotential;
            UserId = userId;
        }

        public BowlingBalls()
        {
            
        }
    }
}
