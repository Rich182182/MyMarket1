using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class Product
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "Product name is required")]
        public string Name { get; set; }

        public string? Description { get; set; }

        [Required(ErrorMessage = "Price is required")]
        [Range(1, int.MaxValue, ErrorMessage = "Price must be greater than 0")]
        public int Price { get; set; }

        // New properties for discount
        public bool IsOnSale { get; set; } = false;

        [Range(0, int.MaxValue, ErrorMessage = "Discount price must be greater than or equal to 0")]
        public int? DiscountPrice { get; set; }

        [Required(ErrorMessage = "Category is required")]
        public int CategoryId { get; set; }

        [ValidateNever]
        public Category Category { get; set; }

        public List<ProductImage>? Images { get; set; }

        // Helper property to get the effective price (either discount or regular)
        [ValidateNever]
        public int EffectivePrice
        {
            get
            {
                return IsOnSale && DiscountPrice.HasValue ? DiscountPrice.Value : Price;
            }
        }
    }
}
