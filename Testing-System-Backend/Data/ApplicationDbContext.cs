using Microsoft.EntityFrameworkCore;
using Testing_System_Backend.Models;


namespace Testing_System_Backend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        // Ye wo Tables hain jo humne SQL mein design kiye thay
        public DbSet<User> Users { get; set; }
        public DbSet<Education> Educations { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<Job> Jobs { get; set; }
        public DbSet<Application> Applications { get; set; }
        public DbSet<TestResult> TestResults { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Relationship settings (User ki boht sari Educations ho sakti hain)
            modelBuilder.Entity<Education>()
                .HasOne<User>()
                .WithMany(u => u.Educations)
                .HasForeignKey(e => e.UserId);
        }
    }
}