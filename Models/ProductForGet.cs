using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class ProductForGet
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int Price { get; set; }
        public int CategoryId { get; set; }
        public bool IsOnSale { get; set; }
        public int? DiscountPrice { get; set; }
        public string FirstImage { get; set; }
        public string CategoryName { get; set; }
        public int ProductLength { get; set; }
    }
}
