using System.Data.SqlClient;

namespace RollRadar.Services
{
    public abstract class BaseService
    {
        protected readonly string _connectionString;

        protected BaseService(string connectionString)
        {
            _connectionString = connectionString;
        }

        protected void ExecuteNonQuery(string query, Action<SqlCommand> parameterize)
        {
            using (var connection = new SqlConnection(_connectionString))
            using (var command = new SqlCommand(query, connection))
            {
                connection.Open();
                parameterize(command);
                command.ExecuteNonQuery();
            }
        }

        protected SqlDataReader ExecuteReader(string query, Action<SqlCommand> parameterize)
        {
            var connection = new SqlConnection(_connectionString);
            var command = new SqlCommand(query, connection);
            parameterize(command);
            connection.Open();
            return command.ExecuteReader(System.Data.CommandBehavior.CloseConnection);
        }
    }
}