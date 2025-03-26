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
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, Name = "Dairy" },
                new Category { Id = 2, Name = "Cereals" },
                new Category { Id = 3, Name = "Seafood" }
                );
        }
    }
}
