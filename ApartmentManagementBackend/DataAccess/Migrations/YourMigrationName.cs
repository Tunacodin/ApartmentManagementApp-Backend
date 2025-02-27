using Microsoft.EntityFrameworkCore.Migrations;

namespace DataAccess.Migrations
{
    public partial class AddBuildingIdToPayments : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "BuildingId",
                table: "Payments",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Payments_BuildingId",
                table: "Payments",
                column: "BuildingId");

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_Buildings_BuildingId",
                table: "Payments",
                column: "BuildingId",
                principalTable: "Buildings",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Payments_Buildings_BuildingId",
                table: "Payments");

            migrationBuilder.DropIndex(
                name: "IX_Payments_BuildingId",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "BuildingId",
                table: "Payments");
        }
    }
} 