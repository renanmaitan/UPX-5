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
                    LightOn = table.Column<bool>(type: "bit", nullable: false),
                    PlantId = table.Column<int>(type: "int", nullable: false)
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
<<<<<<<< HEAD:ApiPlantas/Migrations/20230605225850_initial.cs
                    IsUsed = table.Column<bool>(type: "bit", nullable: false),
                    ImageBase64 = table.Column<string>(type: "varchar(max)", nullable: false)
========
                    IsUsed = table.Column<bool>(type: "bit", nullable: false)
>>>>>>>> 1f73794472cf9a422e527072716d47d7125470d9:ApiPlantas/Migrations/20230602215626_inital.cs
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
