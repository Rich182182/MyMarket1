using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Models;
using Models.Identity;
namespace DataAccess.Data
{
    public class AppDbContext : IdentityDbContext<ApplicationUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Category> Categories { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<ProductImage> ProductImages { get; set; }
        public DbSet<City> Cities { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ProductImage>()
                .HasOne(pi => pi.Product)
                .WithMany(p => p.Images)
                .HasForeignKey(pi => pi.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<City>().HasData(
                
                new City { Id = 1, Name = "New York" },
                new City { Id = 2, Name = "Los Angeles" },
                new City { Id = 3, Name = "Chicago" },
                new City { Id = 4, Name = "Houston" },
                new City { Id = 5, Name = "Phoenix" },
                new City { Id = 6, Name = "Philadelphia" },
                new City { Id = 7, Name = "San Antonio" },
                new City { Id = 8, Name = "San Diego" },
                new City { Id = 9, Name = "Dallas" },
                new City { Id = 10, Name = "San Jose" }
            );
            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, Name = "Dairy" },
                new Category { Id = 2, Name = "Cereals" },
                new Category { Id = 3, Name = "Seafood" },
                new Category { Id = 4, Name = "Bakery" },
                new Category { Id = 5, Name = "Fruits" },
                new Category { Id = 6, Name = "Vegetables" },
                new Category { Id = 7, Name = "Meat" },
                new Category { Id = 8, Name = "Frozen Foods" },
                new Category { Id = 9, Name = "Beverages" },
                new Category { Id = 10, Name = "Snacks" },
                new Category { Id = 11, Name = "Canned Goods" },
                new Category { Id = 12, Name = "Condiments" },
                new Category { Id = 13, Name = "Baking Supplies" },
                new Category { Id = 14, Name = "Pasta & Rice" },
                new Category { Id = 15, Name = "Deli" },
                new Category { Id = 16, Name = "Organic Foods" },
                new Category { Id = 17, Name = "Gluten-Free" },
                new Category { Id = 18, Name = "International Foods" },
                new Category { Id = 19, Name = "Household Items" },
                new Category { Id = 20, Name = "Pet Supplies" }
                );
        }
    }
}
