using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddUserFullNameToPayment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApartmentId",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "BuildingId",
                table: "Payments");

            migrationBuilder.AddColumn<int>(
                name: "CardInfoId",
                table: "Payments",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CardNumber",
                table: "CardInfos",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<string>(
                name: "BankLogoUrl",
                table: "CardInfos",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "BankName",
                table: "CardInfos",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_CardInfoId",
                table: "Payments",
                column: "CardInfoId");

            migrationBuilder.CreateIndex(
                name: "IX_CardInfos_UserId_CardNumber",
                table: "CardInfos",
                columns: new[] { "UserId", "CardNumber" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_CardInfos_CardInfoId",
                table: "Payments",
                column: "CardInfoId",
                principalTable: "CardInfos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Payments_CardInfos_CardInfoId",
                table: "Payments");

            migrationBuilder.DropIndex(
                name: "IX_Payments_CardInfoId",
                table: "Payments");

            migrationBuilder.DropIndex(
                name: "IX_CardInfos_UserId_CardNumber",
                table: "CardInfos");

            migrationBuilder.DropColumn(
                name: "CardInfoId",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "BankLogoUrl",
                table: "CardInfos");

            migrationBuilder.DropColumn(
                name: "BankName",
                table: "CardInfos");

            migrationBuilder.AddColumn<int>(
                name: "ApartmentId",
                table: "Payments",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "BuildingId",
                table: "Payments",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<string>(
                name: "CardNumber",
                table: "CardInfos",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");
        }
    }
}
