using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrgChart.Data;
using OrgChart.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace OrgChart.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DepartmentsController(AppDbContext db) : ControllerBase
{
    // GET /api/departments
    // HR / Admin -> Can see all org | Emp -> Only their org
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var isPrivileged = User.IsInRole("HR") || User.IsInRole("Admin");

        if (isPrivileged)
        {
            var all = await db.Departments
                .Select(d => new { d.Id, d.Name })
                .ToListAsync();

            return Ok(all);
        }

        var deptId = int.Parse(User.FindFirstValue("departmentId")!);
        var own = await db.Departments
            .Where(d => d.Id == deptId)
            .Select(d => new { d.Id, d.Name })
            .FirstOrDefaultAsync();

        return Ok(own is null ? [] : new[] { own });
    }

    // GET /api/departments/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var department = await db.Departments
            .Where(d => d.Id == id)
            .Select(d => new { d.Id, d.Name })
            .FirstOrDefaultAsync();

        if (department is null)
            return NotFound(new
            {
                message = "Department not found."
            });

        return Ok(department);
    }

    // GET /api/departments/{id}/employees
    [HttpGet("{id:int}/employees")]
    public async Task<IActionResult> GetEmployees(int id)
    {
        var isPrivileged = User.IsInRole("HR") || User.IsInRole("Admin");

        if (!isPrivileged)
        {
            var deptId = int.Parse(User.FindFirstValue("departmentId")!);
            if (deptId != id)
                return Forbid();
        }

        var exists = await db.Departments.AnyAsync(d => d.Id == id);
        if (!exists)
            return NotFound(new
            {
                message = "Department not found."
            });

        var employees = await db.Employees
            .Where(e => e.DepartmentId == id)
            .Select(e => new
            {
                e.Id,
                e.Name,
                e.Position,
                Manager = e.Manager == null ? null : new { e.Manager.Id, e.Manager.Name }
            })
            .ToListAsync();

        return Ok(employees);
    }

    // POST /api/departments
    [HttpPost]
    [Authorize(Roles = "HR,Admin")]
    public async Task<IActionResult> Create(Department body)
    {
        db.Departments.Add(body);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = body.Id }, new { body.Id, body.Name });
    }

    // PUT /api/departments/{id}
    [HttpPut("{id:int}")]
    [Authorize(Roles = "HR,Admin")]
    public async Task<IActionResult> Update(int id, Department body)
    {
        var department = await db.Departments.FindAsync(id);
        if (department is null)
            return NotFound(new
            {
                message = "Department not found."
            });

        department.Name = body.Name;
        await db.SaveChangesAsync();

        return Ok(new
        {
            department.Id,
            department.Name
        });
    }

    // DELETE /api/departments/{id}
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "HR,Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var department = await db.Departments.FindAsync(id);
        if (department is null)
            return NotFound(new
            {
                message = "Department not found."
            });

        db.Departments.Remove(department);
        await db.SaveChangesAsync();

        return NoContent();
    }
}