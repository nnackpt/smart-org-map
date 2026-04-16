using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OrgChart.Data;
using OrgChart.Models;

namespace OrgChart.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(AppDbContext db, IConfiguration config) : ControllerBase
{
    private string GenerateToken(Employee employee)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, employee.Id.ToString()),
            new Claim(ClaimTypes.Name, employee.Username),
            new Claim(ClaimTypes.Role, employee.Role.ToString()),
            new Claim("departmentId", employee.DepartmentId.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: config["Jwt:Issuer"],
            audience: config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(double.Parse(config["Jwt:ExpiresInMinutes"]!)),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    // POST /api/auth/login
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var employee = await db.Employees
            .Include(e => e.Department)
            .FirstOrDefaultAsync(e => e.Username == request.Username);

        if (employee is null || !BCrypt.Net.BCrypt.Verify(request.Password, employee.PasswordHash))
            return Unauthorized(new
            {
                message = "Invalid username or password."
            });

        var token = GenerateToken(employee);

        return Ok(new
        {
            token,
            employee = new
            {
                employee.Id,
                employee.Name,
                employee.Username,
                employee.Position,
                employee.Role,
                Department = new { employee.Department!.Id, employee.Department.Name }
            }
        });
    }

    // POST /api/auth/register - Only HR and Admin
    [HttpPost("register")]
    [Authorize(Roles = "HR,Admin")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        var usernameExists = await db.Employees.AnyAsync(e => e.Username == request.Username);
        if (usernameExists)
            return Conflict(new
            {
                message = "Username already exists."
            });

        var departmentExists = await db.Departments.AnyAsync(d => d.Id == request.DepartmentId);
        if (!departmentExists)
            return BadRequest(new
            {
                message = "Department not found."
            });

        var employee = new Employee
        {
            Name = request.Name,
            Username = request.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Position = request.Position,
            DepartmentId = request.DepartmentId,
            ManagerId = request.ManagerId,
            Role = request.Role
        };

        db.Employees.Add(employee);
        await db.SaveChangesAsync();

        return CreatedAtAction(
            "GetById",
            "Employees",
            new { id = employee.Id },
            new { employee.Id, employee.Name, employee.Username, employee.Position, employee.Role }
        );
    }

    // PATCH /api/auth/reset-password
    [HttpPatch("reset-password")]
    [Authorize(Roles = "HR, Admin")]
    public async Task<IActionResult> ResetPassword(ResetPasswordRequest request)
    {
        var employee = await db.Employees.FirstOrDefaultAsync(e => e.Username == request.Username);
        if (employee is null)
            return NotFound(new
            {
                message = "User not found."
            });

        employee.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await db.SaveChangesAsync();

        return Ok(new
        {
            message = "Password reset successfully."
        });
    }
}