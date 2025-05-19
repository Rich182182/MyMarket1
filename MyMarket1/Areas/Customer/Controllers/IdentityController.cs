using DataAccess.Data;
using Microsoft.AspNetCore.Mvc;
using Models.Identity;

namespace MyMarket1.Areas.Customer.Controllers
{
    [Area("Customer")]
    public class IdentityController : Controller
    {
        private readonly AppDbContext _db;
        public IdentityController(AppDbContext db)
        {
            _db = db;
        }
        public IActionResult GetAllCities()
        {
            var cities = _db.Cities.Select(c => c.Name).ToList();
            return Json(new { data = cities });
        }
    }
}
