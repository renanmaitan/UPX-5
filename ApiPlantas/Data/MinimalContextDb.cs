using ApiPlantas.Models;
using Microsoft.EntityFrameworkCore;

namespace ApiPlantas.Data
{
    public class MinimalContextDb : DbContext 
    {
        public MinimalContextDb(DbContextOptions<MinimalContextDb> options) : base(options)
        {
        }
        public DbSet<Plant> Plants { get; set; }
        public DbSet<ArduinoData> ArduinoDatas { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Plant>()
                .HasKey(p => p.Id);

            modelBuilder.Entity<Plant>()
                .Property(p => p.Name)
                .IsRequired()
                .HasColumnType("varchar(200)");

            modelBuilder.Entity<Plant>()
                .Property(p => p.Humity)
                .IsRequired()
                .HasColumnType("float");

            modelBuilder.Entity<Plant>()
                .Property(p => p.Luminosity)
                .IsRequired()
                .HasColumnType("float");

            modelBuilder.Entity<Plant>()
                .Property(p => p.Hours)
                .IsRequired()
                .HasColumnType("float");

            modelBuilder.Entity<Plant>()
                .ToTable("Plants");

            modelBuilder.Entity<ArduinoData>()
                .HasKey(p => p.Id);

            modelBuilder.Entity<ArduinoData>()
                .Property(p => p.Humity)
                .HasColumnType("float");

            modelBuilder.Entity<ArduinoData>()
                .Property(p => p.Luminosity)
                .IsRequired()
                .HasColumnType("float");

            modelBuilder.Entity<ArduinoData>()
                .Property(p => p.Time)
                .HasColumnType("datetime");

            modelBuilder.Entity<ArduinoData>()
                .Property(p => p.PumpOn)
                .HasColumnType("bit");

            modelBuilder.Entity<ArduinoData>()
                .Property(p => p.LightOn)
                .HasColumnType("bit");

            modelBuilder.Entity<ArduinoData>()
                .ToTable("ArduinoDatas");


            base.OnModelCreating(modelBuilder);



        }


    }
}
