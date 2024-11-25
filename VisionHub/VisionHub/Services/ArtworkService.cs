using System.Data;
using System.Data.SqlClient;
using VisionHub.Models;

namespace VisionHub.Services
{
    public class ArtworkService : BaseService
    {
        private readonly string _imageStoragePath;

        public ArtworkService(string connectionString, string imageStoragePath) : base(connectionString)
        {
            _imageStoragePath = imageStoragePath;
        }

        public async Task AddArt(int userID, int categoryId, string title, string description, FileUploadModel model, bool isFeatured)
        {
            try
            {
                // Upload the image and get the file path
                string relativeImagePath = await UploadArtworkAsync(model);

                string query = "INSERT INTO Artworks (UserID, CategoryId, Title, Description, UploadDate, ImagePath, IsFeatured) " +
                               "VALUES (@UserID, @CategoryId, @Title, @Description, @UploadDate, @ImagePath, @IsFeatured)";

                var parameters = new[]
                {
                    new SqlParameter("@UserID", userID),
                    new SqlParameter("@CategoryId", categoryId),
                    new SqlParameter("@Title", title),
                    new SqlParameter("@Description", description),
                    new SqlParameter("@UploadDate", DateTime.Now),
                    new SqlParameter("@ImagePath", relativeImagePath),
                    new SqlParameter("@IsFeatured", isFeatured)
                };

                ExecuteNonQuery(query, parameters);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error uploading artwork: {ex.Message}");
            }
        }

        public async Task UpdateArt(int artID, string newTitle, string newDescription, FileUploadModel newImage)
        {
            string imageFileName = null;
            if (newImage?.File != null)
            {
                
                imageFileName = Guid.NewGuid().ToString() + Path.GetExtension(newImage.File.FileName);
                string imagePath = Path.Combine(_imageStoragePath, imageFileName);
                Directory.CreateDirectory(_imageStoragePath);

                // Save the new image file
                using (var stream = new FileStream(imagePath, FileMode.Create))
                {
                    await newImage.File.CopyToAsync(stream);
                }
            }

            string query = "UPDATE Artworks SET Title = @Title, Description = @Description" +
                           (imageFileName != null ? ", ImagePath = @ImagePath" : "") + " WHERE ArtID = @ArtID";

            var parameters = new List<SqlParameter>
            {
                new SqlParameter("@ArtID", artID),
                new SqlParameter("@Title", newTitle),
                new SqlParameter("@Description", newDescription)
            };

            if (imageFileName != null)
            {
                parameters.Add(new SqlParameter("@ImagePath", Path.Combine("images", "artworks", imageFileName)));
            }

            ExecuteNonQuery(query, parameters.ToArray());
        }

        public void DeleteArt(int artID)
        {
           
            string querySelect = "SELECT ImagePath FROM Artworks WHERE ArtID = @ArtID";
            var parametersSelect = new[] { new SqlParameter("@ArtID", artID) };
            var imagePath = ExecuteScalar(querySelect, parametersSelect)?.ToString();

            if (imagePath != null)
            {
                string fullPath = Path.Combine(_imageStoragePath, imagePath);
                if (File.Exists(fullPath))
                {
                    File.Delete(fullPath);
                }
            }

            
            string queryDelete = "DELETE FROM Artworks WHERE ArtID = @ArtID";
            var parametersDelete = new[] { new SqlParameter("@ArtID", artID) };
            ExecuteNonQuery(queryDelete, parametersDelete);
        }

        public List<Artworks> ConvertDataTableToArtworksList(DataTable dataTable)
        {
            List<Artworks> artworksList = new List<Artworks>();

            foreach (DataRow row in dataTable.Rows)
            {
                Artworks artwork = new Artworks
                {
                    Id = Convert.ToInt32(row["ArtID"]),
                    UserID = Convert.ToInt32(row["UserID"]),
                    Title = row["Title"].ToString(),
                    Description = row["Description"].ToString(),
                    ImagePath = row["ImagePath"].ToString(),
                    CategoryId = Convert.ToInt32(row["CategoryId"])
                };

                artworksList.Add(artwork);
            }

            return artworksList;
        }

        public List<Artworks> GetUserArt(int userID)
        {
            string query = "SELECT * FROM Artworks WHERE UserID = @UserID";
            var parameters = new[] { new SqlParameter("@UserID", userID) };

            DataTable dataTable = ExecuteQuery(query, parameters);
            return ConvertDataTableToArtworksList(dataTable);
        }

        public List<Artworks> GetArtId(int artID)
        {
            string query = "SELECT * FROM Artworks WHERE ArtID = @ArtID";
            var parameters = new[] { new SqlParameter("@ArtID", artID) };

            DataTable dataTable = ExecuteQuery(query, parameters);
            return ConvertDataTableToArtworksList(dataTable);
        }

        public List<Artworks> GetAllArt()
        {
            string query = "SELECT * FROM Artworks";
            DataTable dataTable = ExecuteQuery(query);
            return ConvertDataTableToArtworksList(dataTable);
        }

        public List<Artworks> GetFeaturedArtworks()
        {
            string query = "SELECT TOP 5 * FROM Artworks WHERE IsFeatured = 1 ORDER BY NEWID()";
            DataTable dataTable = ExecuteQuery(query);
            return ConvertDataTableToArtworksList(dataTable);
        }

        public List<Artworks> GetArtCategoryId(int categoryId)
        {
            string query = "SELECT * FROM Artworks WHERE CategoryId = @CategoryId";
            var parameters = new[] { new SqlParameter("@CategoryId", categoryId) };

            DataTable dataTable = ExecuteQuery(query, parameters);
            return ConvertDataTableToArtworksList(dataTable);
        }

        public async Task<string> UploadArtworkAsync(FileUploadModel model)
        {
            if (model?.File == null || model.File.Length == 0)
                throw new ArgumentException("No file uploaded.");

            // Generate a unique filename for the image
            string imageFileName = Guid.NewGuid().ToString() + Path.GetExtension(model.File.FileName);
            string imagePath = Path.Combine(_imageStoragePath, imageFileName);

            // Ensure the directory exists
            Directory.CreateDirectory(_imageStoragePath);

            // Save the image file to the server
            using (var stream = new FileStream(imagePath, FileMode.Create))
            {
                await model.File.CopyToAsync(stream);
            }

            // Return the relative file path for the database
            return Path.Combine("/images", "artworks", imageFileName);
        }
    }
}
