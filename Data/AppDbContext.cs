using Microsoft.EntityFrameworkCore;
using OrgChart.Models;

namespace OrgChart.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Employee> Employees => Set<Employee>();
    private const string SystemAdminHash = "$2a$11$Fu7E/n6qucmdg7S/z21pweNyE5QCaAPPBW57gUhV7jN/KYa8G8fhm";

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Self-referecing relationship
        modelBuilder.Entity<Employee>()
            .HasOne(e => e.Manager)
            .WithMany(e => e.Subordinates)
            .HasForeignKey(e => e.ManagerId)
            .OnDelete(DeleteBehavior.Restrict);

        // Seed data
        modelBuilder.Entity<Department>().HasData(
            new Department { Id = -1, Name = "System" }
        );

        modelBuilder.Entity<Employee>().HasData(
            new Employee {
                Id = 1,
                Name = "System Administrator",
                Username = "admin",
                PasswordHash = SystemAdminHash,
                Position = "System Administrator",
                Role = UserRole.Admin,
                DepartmentId = -1,
                ManagerId = null
            }
        );
    }
}