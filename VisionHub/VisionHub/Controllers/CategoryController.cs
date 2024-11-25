using Microsoft.AspNetCore.Mvc;
using VisionHub.Models;
using VisionHub.Services;

namespace VisionHub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly CategoryService _categoryService;

        public CategoryController(CategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        // Get all categories
        [HttpGet]
        public IActionResult GetAllCategories()
        {
            var categories = _categoryService.GetAllCategories();
            return Ok(categories);
        }

        // Get category by ID
        [HttpGet("{id}")]
        public IActionResult GetCategoryById(int id)
        {
            var category = _categoryService.GetCategoryById(id);
            if (category == null)
            {
                return NotFound($"Category with ID {id} not found.");
            }
            return Ok(category);
        }

        // Add a new category
        [HttpPost]
        public IActionResult AddCategory([FromBody] Categories newCategory)
        {
            if (newCategory == null || string.IsNullOrEmpty(newCategory.Name))
            {
                return BadRequest("Invalid category data.");
            }

            _categoryService.AddCategory(newCategory.Name, newCategory.Description);
            return Ok("Category added successfully.");
        }

        // Update an existing category
        [HttpPut("{id}")]
        public IActionResult UpdateCategory(int id, [FromBody] Categories updatedCategory)
        {
            var existingCategory = _categoryService.GetCategoryById(id);
            if (existingCategory == null)
            {
                return NotFound($"Category with ID {id} not found.");
            }

            _categoryService.UpdateCategory(id, updatedCategory.Name, updatedCategory.Description);
            return Ok("Category updated successfully.");
        }

        // Delete a category
        [HttpDelete("{id}")]
        public IActionResult DeleteCategory(int id)
        {
            var category = _categoryService.GetCategoryById(id);
            if (category == null)
            {
                return NotFound($"Category with ID {id} not found.");
            }

            _categoryService.DeleteCategory(id);
            return Ok("Category deleted successfully.");
        }
    }
}
