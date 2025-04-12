using DataAccess.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Models;

namespace MyMarket1.Controllers
{
    public class ProductController : Controller
    {
        private readonly AppDbContext _db;
        public ProductController(AppDbContext db)
        {
            _db = db;
        }

        public IActionResult Index()
        {
            return View();
        }
        [HttpPost]
        public IActionResult Create(Product product)
        {

            if(ModelState.IsValid)
            {
                _db.Products.Add(product);
                _db.SaveChanges();
                return Json(new { id = product.Id });
            }
            return BadRequest(ModelState);
        }
        [HttpPost]
        public IActionResult Edit(Product product)
        {
            if (ModelState.IsValid)
            {
                _db.Products.Update(product);
                _db.SaveChanges();
                return Ok(new { success =true });
            }
            return BadRequest(ModelState);
        }
        [HttpDelete]
        public IActionResult Delete(int id)
        {
            var product = _db.Products.Find(id);
            if (product != null)
            {
                _db.Products.Remove(product);
                _db.SaveChanges();
                return Ok(new { success = true });
            }
            return View();
        }
        [HttpGet]
        public IActionResult GetAll()
        {
            var products = _db.Products.Include(p => p.Category).Select(p => new {
                p.Id,
                p.Name,
                p.Price,
                p.Description,
                p.ImageUrl,
                CategoryName = p.Category.Name,
                p.CategoryId
            }).ToList();

            return Json(products);
        }
        [HttpGet]
        public IActionResult GetCategories()
        {
            var categories = _db.Categories.Select(c => new { c.Id, c.Name }).ToList();
            return Json(categories);
        }


    }
}
