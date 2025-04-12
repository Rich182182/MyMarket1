// Models/ProductImage.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Models
{
    public class ProductImage
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string ImageUrl { get; set; }
        
        public int ProductId { get; set; }
        
        [ForeignKey("ProductId")]
        public Product Product { get; set; }
        
        // ќпредел€ет пор€док отображени€ изображений
        public int DisplayOrder { get; set; }
    }
}
