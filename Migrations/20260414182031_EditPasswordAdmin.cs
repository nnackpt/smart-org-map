using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OrgChart.Migrations
{
    /// <inheritdoc />
    public partial class EditPasswordAdmin : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$Fu7E/n6qucmdg7S/z21pweNyE5QCaAPPBW57gUhV7jN/KYa8G8fhm");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$6TXOS5tjyuw8ucG3iF8QVOSimUg9/IxH.263q0JuUYUoOiOwRgXd");
        }
    }
}
