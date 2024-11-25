using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using VisionHub.Services;
using System.IO;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add CORS policy for localhost:3000
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalhost3000", policyBuilder =>
    {
        policyBuilder.WithOrigins("http://localhost:3000")
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

// Ensure the artworks directory exists
var artworkDirectory = Path.Combine(builder.Environment.ContentRootPath, "wwwroot", "images", "artworks");
if (!Directory.Exists(artworkDirectory))
{
    Directory.CreateDirectory(artworkDirectory);
}

// Add services to the container
builder.Services.AddScoped<ArtworkService>(provider =>
    new ArtworkService(builder.Configuration.GetConnectionString("VisionHubDB"), builder.Configuration["ImageStoragePath"]));
builder.Services.AddScoped<CommentService>(provider =>
    new CommentService(builder.Configuration.GetConnectionString("VisionHubDB")));
builder.Services.AddScoped<UserService>(provider =>
    new UserService(builder.Configuration.GetConnectionString("VisionHubDB")));
builder.Services.AddScoped<CategoryService>(provider =>
    new CategoryService(builder.Configuration.GetConnectionString("VisionHubDB")));

// JWT Authentication configuration
var secretKey = builder.Configuration["Jwt:SecretKey"];
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(secretKey)),
        ValidateIssuer = false,
        ValidateAudience = false
    };
});

// Add Controllers and Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "VisionHub API", Version = "v1" });

    // Add custom operation filter to handle file uploads
    options.OperationFilter<FileUploadOperationFilter>();
});

// Configure large file size for form uploads
builder.Services.Configure<FormOptions>(options =>
{
    options.ValueLengthLimit = int.MaxValue;
    options.MultipartBodyLengthLimit = long.MaxValue; // Set large file upload limits
});


var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStaticFiles();
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(artworkDirectory),
    RequestPath = "/images/artworks"
});


app.UseCors("AllowLocalhost3000");

app.UseHttpsRedirection(); // Redirect HTTP requests to HTTPS

app.UseAuthentication(); // Add authentication middleware
app.UseAuthorization(); // Add authorization middleware

app.MapControllers(); // Map controller routes

app.Run(); // Run the application
