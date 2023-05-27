﻿// <auto-generated />
using System;
using ApiPlantas.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace ApiPlantas.Migrations
{
    [DbContext(typeof(MinimalContextDb))]
    partial class MinimalContextDbModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "6.0.3")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder, 1L, 1);

            modelBuilder.Entity("ApiPlantas.Models.ArduinoData", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"), 1L, 1);

                    b.Property<double>("Humity")
                        .HasColumnType("float");

                    b.Property<bool>("LightOn")
                        .HasColumnType("bit");

                    b.Property<double>("Luminosity")
                        .HasColumnType("float");

                    b.Property<bool>("PumpOn")
                        .HasColumnType("bit");

                    b.Property<DateTime>("Time")
                        .HasColumnType("datetime");

                    b.HasKey("Id");

                    b.ToTable("ArduinoDatas", (string)null);
                });

            modelBuilder.Entity("ApiPlantas.Models.Plant", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"), 1L, 1);

                    b.Property<double>("Hours")
                        .HasColumnType("float");

                    b.Property<double>("Humity")
                        .HasColumnType("float");

                    b.Property<double>("Luminosity")
                        .HasColumnType("float");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("varchar(200)");

                    b.HasKey("Id");

                    b.ToTable("Plants", (string)null);
                });
#pragma warning restore 612, 618
        }
    }
}
