using DataAccess.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Models;
using System.IO;
using System;
using Microsoft.AspNetCore.Hosting;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;

namespace MyMarket1.Controllers
{
    public class ProductController : Controller
    {
        private readonly AppDbContext _db;
        private readonly IWebHostEnvironment _webHostEnvironment;

        public ProductController(AppDbContext db, IWebHostEnvironment webHostEnvironment)
        {
            _db = db;
            _webHostEnvironment = webHostEnvironment;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public IActionResult Create(Product product)
        {
            if (ModelState.IsValid)
            {
                _db.Products.Add(product);
                _db.SaveChanges();
                return Json(new { id = product.Id });
            }
            return BadRequest(ModelState);
        }

        [HttpPost]
        public IActionResult Edit(Product product, [FromForm] List<int>? imagesToDelete = null)
        {
            if (ModelState.IsValid)
            {
                // First update the product
                _db.Products.Update(product);

                // Delete images if specified
                if (imagesToDelete != null && imagesToDelete.Count > 0)
                {
                    foreach (var imageId in imagesToDelete)
                    {
                        DeleteSingleImage(imageId);
                    }
                }

                _db.SaveChanges();
                return Ok(new { success = true });
            }
            return BadRequest(ModelState);
        }


        [HttpDelete]
        public IActionResult Delete(int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var product = _db.Products.Find(id);
            if (product != null)
            {
                // Get all images associated with the product
                var images = _db.ProductImages.Where(pi => pi.ProductId == id).ToList();

                // Delete each image file from the server
                foreach (var image in images)
                {
                    DeleteImageFile(image.ImageUrl);
                }

                // Remove images from database
                _db.ProductImages.RemoveRange(images);

                // Delete product directory if it exists
                string productDirectory = Path.Combine(_webHostEnvironment.WebRootPath, "images", "products", id.ToString());
                if (Directory.Exists(productDirectory))
                {
                    Directory.Delete(productDirectory, true);
                }

                // Remove product from database
                _db.Products.Remove(product);
                _db.SaveChanges();

                return Ok(new { success = true });
            }
            return NotFound();
        }

        // Helper method to delete image files
        private void DeleteImageFile(string imageUrl)
        {
            if (!string.IsNullOrEmpty(imageUrl))
            {
                var imagePath = Path.Combine(_webHostEnvironment.WebRootPath, imageUrl.TrimStart('/'));
                if (System.IO.File.Exists(imagePath))
                {
                    System.IO.File.Delete(imagePath);
                }
            }
        }

        // Helper method to delete a single image
        private void DeleteSingleImage(int imageId)
        {
            var image = _db.ProductImages.Find(imageId);
            if (image != null)
            {
                // Delete file from disk
                DeleteImageFile(image.ImageUrl);

                // Remove from database
                _db.ProductImages.Remove(image);
            }
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var products = _db.Products.Include(p => p.Category)
                .Include(p => p.Images)
                .Select(p => new {
                    p.Id,
                    p.Name,
                    p.Price,
                    p.Description,
                    ImageUrl = p.Images != null && p.Images.Any() ?
                        p.Images.OrderBy(i => i.DisplayOrder).First().ImageUrl : null,
                    CategoryName = p.Category.Name,
                    p.CategoryId,
                    ImageCount = p.Images != null ? p.Images.Count : 0
                }).ToList();

            return Json(products);
        }

        [HttpGet]
        public IActionResult GetCategories()
        {
            var categories = _db.Categories.Select(c => new { c.Id, c.Name }).ToList();
            return Json(categories);
        }

        [HttpPost]
        public IActionResult UploadImages(int productId)
        {
            try
            {
                var files = Request.Form.Files;
                if (files == null || files.Count == 0)
                {
                    return BadRequest("No files uploaded");
                }

                // Get product to check if it exists
                var product = _db.Products.Find(productId);
                if (product == null)
                {
                    return NotFound("Product not found");
                }

                // Check if this would exceed the 8 image limit
                var existingImageCount = _db.ProductImages.Count(pi => pi.ProductId == productId);
                if (existingImageCount + files.Count > 8)
                {
                    return BadRequest($"Maximum 8 images allowed per product. You already have {existingImageCount} images.");
                }

                // Create directory for product if it doesn't exist
                string productDirectory = Path.Combine(_webHostEnvironment.WebRootPath, "images", "products", productId.ToString());
                if (!Directory.Exists(productDirectory))
                {
                    Directory.CreateDirectory(productDirectory);
                }

                // Process all files
                var uploadedImages = new List<object>();

                foreach (var file in files)
                {
                    if (file.Length == 0)
                    {
                        continue; // Skip empty files
                    }

                    // Create a unique file name
                    string fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                    string filePath = Path.Combine(productDirectory, fileName);

                    // Save file to disk
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        file.CopyTo(stream);
                    }

                    // Calculate display order (highest + 1)
                    int displayOrder = 0;
                    var existingImages = _db.ProductImages.Where(pi => pi.ProductId == productId).ToList();
                    if (existingImages.Any())
                    {
                        displayOrder = existingImages.Max(pi => pi.DisplayOrder) + 1;
                    }

                    // Create new ProductImage record
                    var productImage = new ProductImage
                    {
                        ProductId = productId,
                        ImageUrl = $"/images/products/{productId}/{fileName}",
                        DisplayOrder = displayOrder
                    };

                    _db.ProductImages.Add(productImage);
                    _db.SaveChanges();

                    uploadedImages.Add(new
                    {
                        id = productImage.Id,
                        imageUrl = productImage.ImageUrl,
                        displayOrder = productImage.DisplayOrder
                    });
                }

                return Json(new
                {
                    success = true,
                    uploadCount = uploadedImages.Count,
                    images = uploadedImages
                });
            }
            catch (Exception ex)
            {
                return BadRequest($"Error uploading image: {ex.Message}");
            }
        }


        [HttpDelete]
        public IActionResult DeleteImage(int imageId)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                DeleteSingleImage(imageId);
                _db.SaveChanges();
                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                return BadRequest($"Error deleting image: {ex.Message}");
            }
        }

        [HttpGet]
        public IActionResult GetProductImages(int productId)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var images = _db.ProductImages
                .Where(pi => pi.ProductId == productId)
                .OrderBy(pi => pi.DisplayOrder)
                .Select(pi => new { pi.Id, pi.ImageUrl, pi.DisplayOrder })
                .ToList();

            return Json(images);
        }

        [HttpPost]
        public IActionResult SaveProductWithImages(Product product, List<int> imagesToDelete)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // For new products
            if (product.Id == 0)
            {
                _db.Products.Add(product);
                _db.SaveChanges();
                return Json(new { success = true, id = product.Id });
            }
            // For existing products
            else
            {
                // Update product
                _db.Products.Update(product);

                // Delete images if specified
                if (imagesToDelete != null && imagesToDelete.Count > 0)
                {
                    foreach (var imageId in imagesToDelete)
                    {
                        DeleteSingleImage(imageId);
                    }
                }

                _db.SaveChanges();
                return Json(new { success = true });
            }
        }
    }
}
