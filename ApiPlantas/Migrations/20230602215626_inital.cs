using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ApiPlantas.Migrations
{
    public partial class inital : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ArduinoDatas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Humity = table.Column<double>(type: "float", nullable: false),
                    Luminosity = table.Column<double>(type: "float", nullable: false),
                    Time = table.Column<DateTime>(type: "datetime", nullable: false),
                    PumpOn = table.Column<bool>(type: "bit", nullable: false),
                    LightOn = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ArduinoDatas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Plants",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "varchar(200)", nullable: false),
                    Humity = table.Column<double>(type: "float", nullable: false),
                    Luminosity = table.Column<double>(type: "float", nullable: false),
                    Hours = table.Column<double>(type: "float", nullable: false),
                    IsUsed = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Plants", x => x.Id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ArduinoDatas");

            migrationBuilder.DropTable(
                name: "Plants");
        }
    }
}
