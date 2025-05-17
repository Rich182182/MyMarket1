using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class HomeGetProducts
    {
        // Use proper binding attribute for complex types in query strings
        [FromQuery(Name = "categories")]
        public string? categories { get; set; }

        [FromQuery(Name = "onSale")]
        public bool? onSale { get; set; }

        [FromQuery(Name = "page")]
        public int page { get; set; } = 1; // Default value

        [FromQuery(Name = "elements")]
        public int elements { get; set; } = 10; // Default value
    }

}
