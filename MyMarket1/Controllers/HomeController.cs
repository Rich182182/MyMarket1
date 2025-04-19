using DataAccess.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Models;
using System.Diagnostics;

namespace MyMarket1.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly AppDbContext _db;

        public HomeController(ILogger<HomeController> logger, AppDbContext db)
        {
            _logger = logger;
            _db = db;
        }

        public IActionResult Index()
        {
            return View();
        }
        public IActionResult Privacy()
        {
            return View();
        }
        [HttpGet]
        public IActionResult GetAllProducts()
        {
            var products = _db.Products.Include(p => p.Category).Include(p => p.Images)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Description,
                    p.Price,
                    p.CategoryId,
                    p.IsOnSale,
                    p.DiscountPrice,
                    FirstImape = p.Images.FirstOrDefault().ImageUrl,
                    CategoryName = p.Category.Name
                }
                ).ToList();
            return Json(new { data = products });
        }
        [HttpGet]
        public IActionResult GetProduct(int productId)
        {
            var productfromDb = _db.Products.Where(u => u.Id == productId).Include(p=>p.Category).Include(p=>p.Images)
                .Select(p=>new
                {
                    p.Id,
                    p.Name,
                    p.Description,
                    p.Price,
                    p.CategoryId,
                    p.IsOnSale,
                    p.DiscountPrice,
                    FirstImape = p.Images.FirstOrDefault().ImageUrl,
                    CategoryName = p.Category.Name,
                    ImagesUrl = p.Images.ToList()
                });
            return Json(new { data = productfromDb });
        }
    }
}
