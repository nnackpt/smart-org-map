namespace OrgChart.Models;

public record LoginRequest(string Username, string Password);

public record ResetPasswordRequest(string Username, string NewPassword);

public record RegisterRequest(
    string Name,
    string Username,
    string Password,
    string Position,
    int DepartmentId,
    int? ManagerId,
    UserRole Role
);