using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class RemoveUnusedComplaintColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProcessedAt",
                table: "Complaints");

            migrationBuilder.DropColumn(
                name: "ProcessedByAdminId",
                table: "Complaints");

            migrationBuilder.DropColumn(
                name: "Solution",
                table: "Complaints");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ProcessedAt",
                table: "Complaints",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ProcessedByAdminId",
                table: "Complaints",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Solution",
                table: "Complaints",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
