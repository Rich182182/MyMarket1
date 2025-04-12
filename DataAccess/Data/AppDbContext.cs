using Microsoft.EntityFrameworkCore;
using Models;
namespace DataAccess.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Product> Products { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            
            /*modelBuilder.Entity<Product>()
                .HasOne(p => p.Category)
                .WithMany()
                .HasForeignKey(p => p.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);*/

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
