using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddComplaintColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsInProgress",
                table: "Complaints");

            migrationBuilder.DropColumn(
                name: "IsResolved",
                table: "Complaints");

            migrationBuilder.AddColumn<decimal>(
                name: "DelayPenaltyAmount",
                table: "Payments",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DelayedDays",
                table: "Payments",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalAmount",
                table: "Payments",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ContractFile",
                table: "Contracts",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

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

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "Complaints",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Surveys",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByAdminId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    BuildingId = table.Column<int>(type: "int", nullable: false),
                    TotalResponses = table.Column<int>(type: "int", nullable: false),
                    Questions = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Results = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Surveys", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Surveys_Buildings_BuildingId",
                        column: x => x.BuildingId,
                        principalTable: "Buildings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Surveys_Users_CreatedByAdminId",
                        column: x => x.CreatedByAdminId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Surveys_BuildingId",
                table: "Surveys",
                column: "BuildingId");

            migrationBuilder.CreateIndex(
                name: "IX_Surveys_CreatedByAdminId",
                table: "Surveys",
                column: "CreatedByAdminId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Surveys");

            migrationBuilder.DropColumn(
                name: "DelayPenaltyAmount",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "DelayedDays",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "TotalAmount",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "ProcessedAt",
                table: "Complaints");

            migrationBuilder.DropColumn(
                name: "ProcessedByAdminId",
                table: "Complaints");

            migrationBuilder.DropColumn(
                name: "Solution",
                table: "Complaints");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Complaints");

            migrationBuilder.AlterColumn<string>(
                name: "ContractFile",
                table: "Contracts",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500);

            migrationBuilder.AddColumn<bool>(
                name: "IsInProgress",
                table: "Complaints",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsResolved",
                table: "Complaints",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }
    }
}
