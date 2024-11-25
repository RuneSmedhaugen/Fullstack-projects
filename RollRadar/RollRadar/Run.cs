/*
using RollRadar.Models;
using System;
using RollRadar.Services;

public class Run
{
    private UserService _userService;
    private BowlingBallService _bowlingBallService;
    private AuthenticationService _authService;
    private BowlingAlleyService _bowlingAlleyService;
    private ScoreService _scoreService;
    private readonly string _connectionString;
    private Users _loggedInUser;
    private int _currentUserId;

    public Run(string connectionString)
    {
        _connectionString = connectionString;
        _userService = new UserService(_connectionString);
        _authService = new AuthenticationService(_userService);
        _bowlingBallService = new BowlingBallService(_connectionString, _loggedInUser);
        _bowlingAlleyService = new BowlingAlleyService(_connectionString, _loggedInUser);
        _scoreService = new ScoreService(_connectionString, _loggedInUser);
    }

    public void Start()
    {
        Console.WriteLine("Welcome to the Bowling Review App!");
        ShowLoginMenu();
    }

    private void ShowLoginMenu()
    {
        while (_loggedInUser == null)
        {
            Console.WriteLine("1. Log in");
            Console.WriteLine("2. Register");
            Console.Write("Select an option: ");
            string option = Console.ReadLine();

            switch (option)
            {
                case "1":
                    Login();
                    break;
                case "2":
                    Register();
                    break;
                default:
                    Console.WriteLine("Invalid option. Please select 1 or 2.");
                    break;
            }
        }
    }

    private void Login()
    {
        Console.WriteLine("Login:");
        Console.Write("Email: ");
        string email = Console.ReadLine();

        Console.Write("Password: ");
        string password = Console.ReadLine();

        _loggedInUser = _authService.Login(email, password);

        if (_loggedInUser != null)
        {
            _currentUserId = _loggedInUser.Id;

            _bowlingBallService = new BowlingBallService(_connectionString, _loggedInUser);
            _bowlingAlleyService = new BowlingAlleyService(_connectionString, _loggedInUser);
            _scoreService = new ScoreService(_connectionString, _loggedInUser);

            Console.WriteLine($"Login successful! Welcome, {_loggedInUser.Name}.");
            MainMenu();
        }
        else
        {
            Console.WriteLine("Invalid email or password. Please try again.");
        }
    }


    private void Register()
    {
        Console.WriteLine("Register:");
        Console.Write("Name: ");
        string name = Console.ReadLine();

        Console.Write("Email: ");
        string email = Console.ReadLine();

        Console.Write("Password: ");
        string password = Console.ReadLine();

        Console.Write("Confirm Password: ");
        string confirmPassword = Console.ReadLine();

        if (password != confirmPassword)
        {
            Console.WriteLine("Passwords do not match. Please try again.");
            return;
        }

        Console.Write("Age: ");
        int age = int.Parse(Console.ReadLine());

        Console.Write("Hand (Left/Right): ");
        string hand = Console.ReadLine();

        Console.Write("Image URL (optional): ");
        string image = Console.ReadLine();

        Console.Write("Comments (optional): ");
        string comments = Console.ReadLine();

        // Create new user object
        Users newUser = new Users
        {
            Name = name,
            Email = email,
            Age = age,
            Hand = hand,
            Image = image,
            Comments = comments
        };

        _userService.Register(newUser, password);
        Console.WriteLine("Registration successful! You can now log in.");
    }

    private void MainMenu()
    {
        bool exit = false;

        while (!exit && _loggedInUser != null)
        {
            Console.WriteLine($"id on currentuserid: {_currentUserId}");
            Console.WriteLine($"id: {_loggedInUser.Id}");
            Console.WriteLine($"Hello, {_loggedInUser.Name}!");
            Console.WriteLine("Main Menu:");
            Console.WriteLine("1. Manage Bowling Balls");
            Console.WriteLine("2. Manage Bowling Alleys");
            Console.WriteLine("3. Manage Scores");
            Console.WriteLine("4. Edit Profile");
            Console.WriteLine("5. Log off");
            Console.WriteLine("6. Exit");

            Console.Write("Please select an option: ");
            string choice = Console.ReadLine();

            switch (choice)
            {
                case "1":
                    BowlingBallMenu();
                    break;
                case "2":
                    BowlingAlleyMenu();
                    break;
                case "3":
                    ScoreMenu();
                    break;
                case "4":
                    EditProfile();
                    break;
                case "5":
                    LogOff();
                    break;
                case "6":
                    exit = true;
                    break;
                default:
                    Console.WriteLine("Invalid choice, please try again.");
                    break;
            }
        }
    }

    private void LogOff()
    {
        Console.WriteLine("Logging off...");
        _loggedInUser = null;
        ShowLoginMenu();
    }

    private void BowlingBallMenu()
    {
        bool goBack = false;

        while (!goBack)
        {
            Console.WriteLine("Bowling Ball Menu:");
            Console.WriteLine("1. View Bowling Balls");
            Console.WriteLine("2. Add Bowling Ball");
            Console.WriteLine("3. Edit Bowling Ball");
            Console.WriteLine("4. Delete Bowling Ball");
            Console.WriteLine("5. Back to Main Menu");

            Console.Write("Please select an option: ");
            string choice = Console.ReadLine();

            switch (choice)
            {
                case "1":
                    _bowlingBallService.ViewAllBowlingBalls();
                    break;
                case "2":
                    _bowlingBallService.AddBowlingBall(_currentUserId);
                    break;
                case "3":
                    Console.Write("Enter the Bowling Ball ID to edit: ");
                    int editId = int.Parse(Console.ReadLine());
                    _bowlingBallService.EditBowlingBall(editId);
                    break;
                case "4":
                    Console.Write("Enter the Bowling Ball ID to delete: ");
                    int deleteId = int.Parse(Console.ReadLine());
                    _bowlingBallService.DeleteBowlingBall(deleteId);
                    break;
                case "5":
                    goBack = true;
                    break;
                default:
                    Console.WriteLine("Invalid choice, please try again.");
                    break;
            }
        }
    }

    private void BowlingAlleyMenu()
    {
        bool goBack = false;

        while (!goBack)
        {
            Console.WriteLine("Bowling Alley Menu:");
            Console.WriteLine("1. View Bowling Alleys");
            Console.WriteLine("2. Add Bowling Alley");
            Console.WriteLine("3. Edit Bowling Alley");
            Console.WriteLine("4. Delete Bowling Alley");
            Console.WriteLine("5. Back to Main Menu");

            Console.Write("Please select an option: ");
            string choice = Console.ReadLine();

            switch (choice)
            {
                case "1":
                    _bowlingAlleyService.ViewAllBowlingAlleys();
                    break;
                case "2":
                    _bowlingAlleyService.AddBowlingAlley(_currentUserId);
                    break;
                case "3":
                    Console.Write("Enter the Bowling Alley ID to edit: ");
                    int editId = int.Parse(Console.ReadLine());
                    _bowlingAlleyService.EditBowlingAlley(editId);
                    break;
                case "4":
                    Console.Write("Enter the Bowling Alley ID to delete: ");
                    int deleteId = int.Parse(Console.ReadLine());
                    _bowlingAlleyService.DeleteBowlingAlley(deleteId);
                    break;
                case "5":
                    goBack = true;
                    break;
                default:
                    Console.WriteLine("Invalid choice, please try again.");
                    break;
            }
        }
    }

    private void ScoreMenu()
    {
        bool goBack = false;

        while (!goBack)
        {
            Console.WriteLine("Score Menu:");
            Console.WriteLine("1. View Scores");
            Console.WriteLine("2. Add Score");
            Console.WriteLine("3. Edit Score");
            Console.WriteLine("4. Delete Score");
            Console.WriteLine("5. Back to Main Menu");

            Console.Write("Please select an option: ");
            string choice = Console.ReadLine();

            switch (choice)
            {
                case "1":
                    _scoreService.ViewAllScores();
                    break;
                case "2":
                    _scoreService.AddScore();
                    break;
                case "3":
                    Console.Write("Enter the Score ID to edit: ");
                    int editId = int.Parse(Console.ReadLine());
                    _scoreService.EditScore(editId);
                    break;
                case "4":
                    Console.Write("Enter the Score ID to delete: ");
                    int deleteId = int.Parse(Console.ReadLine());
                    _scoreService.DeleteScore(deleteId);
                    break;
                case "5":
                    goBack = true;
                    break;
                default:
                    Console.WriteLine("Invalid choice, please try again.");
                    break;
            }
        }
    }

    private void EditProfile()
    {
        Console.WriteLine("Profile editing is not yet implemented.");
    }
}
*/