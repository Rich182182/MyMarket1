using Microsoft.AspNetCore.Mvc;

namespace MyMarket1.Controllers
{
    public class CategoryController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
