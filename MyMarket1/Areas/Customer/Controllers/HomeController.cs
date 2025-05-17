using DataAccess.Data;
using DataAccess.Migrations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Models;
using System.Diagnostics;
using Product = Models.Product;
using ProductImage = Models.ProductImage;

namespace MyMarket1.Controllers
{
    [Area("Customer")]
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
        public IActionResult GetProduct(int productId)
        {
            var productfromDb = _db.Products.Where(u => u.Id == productId).Include(p => p.Category).Include(p => p.Images)
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
                    CategoryName = p.Category.Name,
                    ImagesUrl = p.Images.ToList()
                });
            return Json(new { data = productfromDb });
        }
        public IActionResult GetProductsForPage(int elements, bool? onSale, string? categories, string? search, int page = 1)
        {

            var sw = Stopwatch.StartNew();
            var products = _db.Products.Include(p => p.Category).Include(p => p.Images).OrderBy(p => p.Id).Select(p => new 
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
                productLength = 0
            }).ToList();
            if(!string.IsNullOrEmpty(search))
            {
                products = products.Where(p => p.Name.Contains(search, StringComparison.OrdinalIgnoreCase)).ToList();
            }
            if (onSale != null)
            {
                products = products.Where(p => p.IsOnSale == onSale).ToList();
            }
            if (categories!= null)
            {
                products = products.Where(p => categories.Split(',').Select(int.Parse).Contains(p.CategoryId)).ToList();
            }
            var productsLength = products.Count();
            products = products.Skip((page - 1) * elements).Take(elements).ToList();
            sw.Stop();
            return Json(new {
                data = products,
                productLength = productsLength,
                executionTime = sw.ElapsedMilliseconds
            });
        }
        [HttpGet]
        public IActionResult GetCategories()
        {
            var categories = _db.Categories.Select(c => new { c.Id, c.Name }).ToList();
            return Json(categories);
        }
        [HttpPost]
        public IActionResult GenerateTestData(int count = 1000)
        {
            var sw = Stopwatch.StartNew();
            var random = new Random();

            // Получим существующие категории из базы данных
            var categories = _db.Categories.ToList();

            // Подготовим список продуктов для добавления
            var products = new List<Product>();

            for (int i = 0; i < count; i++)
            {
                var product = new Product
                {
                    Name = $"Test Product {i}",
                    Description = $"This is test product number {i} with a longer description to simulate real data. It has various features and specifications that would interest potential customers.",
                    Price = random.Next(10, 1000),
                    IsOnSale = random.Next(0, 3) == 0, // 33% вероятность скидки
                    CategoryId = categories[random.Next(0, categories.Count)].Id
                };

                if (product.IsOnSale)
                {
                    // Скидка от 10% до 50%
                    product.DiscountPrice = (int)(product.Price * (1 - (random.Next(10, 50) / 100.0)));
                }

                products.Add(product);
            }

            _db.Products.AddRange(products);
            _db.SaveChanges();

            // После создания товаров, добавим изображения
            var productIds = _db.Products.OrderByDescending(p => p.Id).Take(count).Select(p => p.Id).ToList();
            var productImages = new List<ProductImage>();

            foreach (var productId in productIds)
            {
                // Случайное количество изображений от 1 до 3
                int imageCount = random.Next(1, 4);

                for (int i = 0; i < imageCount; i++)
                {
                    productImages.Add(new ProductImage
                    {
                        ProductId = productId,
                        ImageUrl = $"/images/test/product-{random.Next(1, 3)}.png", // Предполагаем, что у вас есть тестовые изображения
                        DisplayOrder = i
                    });
                }
            }

            _db.ProductImages.AddRange(productImages);
            _db.SaveChanges();

            sw.Stop();

            return Json(new
            {
                success = true,
                message = $"Successfully generated {count} products with images",
                executionTime = sw.ElapsedMilliseconds
            });
        }

    }
}
