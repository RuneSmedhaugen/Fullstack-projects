using System.Data;
using System.Data.SqlClient;
using VisionHub.Models;

namespace VisionHub.Services
{
    public class CategoryService : BaseService
    {
        public CategoryService(string connectionString) : base(connectionString)
        {
        }

        
        public void AddCategory(string name, string description)
        {
            string query =
                "INSERT INTO Categories (Name, Description) VALUES (@Name, @Description)";
            var parameters = new[]
            {
                new SqlParameter("@Name", name),
                new SqlParameter("@Description", description)
            };

            ExecuteNonQuery(query, parameters);
        }

        
        public void UpdateCategory(int categoryId, string newName, string newDescription)
        {
            string query =
                "UPDATE Categories SET Name = @Name, Description = @Description WHERE CategoryID = @CategoryID";
            var parameters = new[]
            {
                new SqlParameter("@CategoryID", categoryId),
                new SqlParameter("@Name", newName),
                new SqlParameter("@Description", newDescription)
            };

            ExecuteNonQuery(query, parameters);
        }

        
        public void DeleteCategory(int categoryId)
        {
            string query =
                "DELETE FROM Categories WHERE CategoryID = @CategoryID";
            var parameters = new[]
            {
                new SqlParameter("@CategoryID", categoryId)
            };

            ExecuteNonQuery(query, parameters);
        }

        
        public List<Categories> GetAllCategories()
        {
            string query = "SELECT * FROM Categories";
            DataTable dataTable = ExecuteQuery(query);
            return ConvertDataTableToCategoryList(dataTable);
        }

        
        public Categories GetCategoryById(int categoryId)
        {
            string query = "SELECT * FROM Categories WHERE CategoryID = @CategoryID";
            var parameters = new[]
            {
                new SqlParameter("@CategoryID", categoryId)
            };

            DataTable dataTable = ExecuteQuery(query, parameters);
            List<Categories> categories = ConvertDataTableToCategoryList(dataTable);

            return categories.FirstOrDefault();
        }

        
        private List<Categories> ConvertDataTableToCategoryList(DataTable dataTable)
        {
            List<Categories> categoriesList = new List<Categories>();

            foreach (DataRow row in dataTable.Rows)
            {
                Categories category = new Categories
                {
                    Id = Convert.ToInt32(row["CategoryID"]),
                    Name = row["Name"].ToString(),
                    Description = row["Description"].ToString()
                };

                categoriesList.Add(category);
            }

            return categoriesList;
        }
    }
}
