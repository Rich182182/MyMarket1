using System.ComponentModel.DataAnnotations;

namespace Models
{
    public class Category
    {
        [Required]
        public int Id { get; set; }
        public string Name { get; set; }
    }
}
