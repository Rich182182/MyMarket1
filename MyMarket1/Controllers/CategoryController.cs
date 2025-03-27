using DataAccess.Data;
using Microsoft.AspNetCore.Mvc;

namespace MyMarket1.Controllers
{
    public class CategoryController : Controller
    {
        private readonly AppDbContext _db;
        public CategoryController(AppDbContext db) {  _db = db; }
        [HttpGet]
        public IActionResult Index()
        {
            var categories = _db.Categories.ToList();
            return View(categories);
        }
    }
}
