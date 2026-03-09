using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Testing_System_Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddMissingColumnsToTestResults : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Grade",
                table: "TestResults",
                newName: "Status");

            migrationBuilder.RenameColumn(
                name: "DateTaken",
                table: "TestResults",
                newName: "TestDate");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "TestDate",
                table: "TestResults",
                newName: "DateTaken");

            migrationBuilder.RenameColumn(
                name: "Status",
                table: "TestResults",
                newName: "Grade");
        }
    }
}
