using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrgChart.Data;
using OrgChart.Models;

namespace OrgChart.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class EmployeesController(AppDbContext db) : ControllerBase
{
    // GET /api/employees
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var employees = await db.Employees
            .Include(e => e.Department)
            .Include(e => e.Manager)
            .Select(e => new
            {
                e.Id,
                e.Name,
                e.Position,
                Department = new { e.Department!.Id, e.Department.Name },
                Manager = e.Manager == null ? null : new { e.Manager.Id, e.Manager.Name }
            })
            .ToListAsync();

        return Ok(employees);
    }

    // GET /api/employees/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var employee = await db.Employees
            .Include(e => e.Department)
            .Include(e => e.Manager)
            .Include(e => e.Subordinates)
            .Where(e => e.Id == id)
            .Select(e => new
            {
                e.Id,
                e.Name,
                e.Position,
                Department = new { e.Department!.Id, e.Department.Name },
                Manager = e.Manager == null ? null : new { e.Manager.Id, e.Manager.Name },
                Subordinates = e.Subordinates.Select(s => new { s.Id, s.Name, s.Position })
            })
            .FirstOrDefaultAsync();

        if (employee is null)
            return NotFound(new
            {
                message = "Employee not found."
            });

        return Ok(employee);
    }

    // POST /api/employees
    [HttpPost]
    [Authorize(Roles = "HR,Admin")]
    public async Task<IActionResult> Create(Employee body)
    {
        db.Employees.Add(body);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = body.Id }, body);
    }

    // PUT /api/employees/{id}
    [HttpPut("{id:int}")]
    [Authorize(Roles = "HR,Admin")]
    public async Task<IActionResult> Update(int id, Employee body)
    {
        var employee = await db.Employees.FindAsync(id);
        if (employee is null)
            return NotFound(new
            {
                message = "Employee not found."
            });

        employee.Name = body.Name;
        employee.Position = body.Position;
        employee.DepartmentId = body.DepartmentId;
        employee.ManagerId = body.ManagerId;

        await db.SaveChangesAsync();

        return Ok(employee);
    }

    // DELETE /api/employees/{id}
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "HR,Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var employee = await db.Employees.FindAsync(id);
        if (employee is null)
            return NotFound(new
            {
                message = "Employee not found."
            });

        db.Employees.Remove(employee);
        await db.SaveChangesAsync();

        return NoContent();
    }
}