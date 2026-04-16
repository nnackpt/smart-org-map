using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrgChart.Data;

namespace OrgChart.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ManagersController(AppDbContext db) : ControllerBase
{
    // GET /api/managers
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var managers = await db.Employees
            .Where(e => e.Subordinates.Any())
            .Include(e => e.Department)
            .Select(e => new
            {
                e.Id,
                e.Name,
                e.Position,
                Department = new { e.Department!.Id, e.Department.Name },
                SubordinateCount = e.Subordinates.Count
            })
            .ToListAsync();

        return Ok(managers);
    }

    // GET /api/managers/{id}/team
    [HttpGet("{id:int}/team")]
    public async Task<IActionResult> GetTeam(int id)
    {
        var manager = await db.Employees
            .Include(e => e.Department)
            .Include(e => e.Subordinates)
            .Where(e => e.Id == id)
            .FirstOrDefaultAsync();

        if (manager is null)
            return NotFound(new
            {
                message = "Employee not found."
            });

        if (!manager.Subordinates.Any())
            return BadRequest(new
            {
                message = "This employee has no subordinates."
            });

        var result = new
        {
            Manager = new { manager.Id, manager.Name, manager.Position },
            Department = new { manager.Department!.Id, manager.Department!.Name },
            Team = manager.Subordinates.Select(s => new { s.Id, s.Name, s.Position })
        };

        return Ok(result);
    }

    // PATCH /api/managers/{employeeId}/assign/{managerId}
    // Assign a manager to an employee
    [HttpPatch("{employeeId:int}/assign/{managerId:int}")]
    public async Task<IActionResult> AssignManager(int employeeId, int managerId)
    {
        if (employeeId == managerId)
            return BadRequest(new
            {
                message = "An employee cannot be their own manager."
            });

        var employee = await db.Employees.FindAsync(employeeId);
        if (employee is null)
            return NotFound(new
            {
                message = "Employee not found."
            });

        var manager = await db.Employees.FindAsync(managerId);
        if (manager is null)
            return NotFound(new
            {
                message = "Manager not found."
            });

        employee.ManagerId = managerId;
        await db.SaveChangesAsync();

        return Ok(new
        {
            message = $"{employee.Name} is now reporting to {manager.Name}.",
            Employee = new { employee.Id, employee.Name },
            Manager = new { manager.Id, manager.Name }
        });
    }

    // PATCH /api/managers/{employeeId}/unassign
    // Remove manager from an employee
    [HttpPatch("{employeeId:int}/unassign")]
    public async Task<IActionResult> UnassignManager(int employeeId)
    {
        var employee = await db.Employees.FindAsync(employeeId);
        if (employee is null)
            return NotFound(new
            {
                message = "Employee not found."
            });

        employee.ManagerId = null;
        await db.SaveChangesAsync();

        return Ok(new
        {
            message = $"{employee.Name} has been unassigned from their manager.",
            Employee = new { employee.Id, employee.Name }
        });
    }
}