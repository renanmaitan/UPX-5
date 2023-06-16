using ApiPlantas.Data;
using ApiPlantas.Models;
using Microsoft.EntityFrameworkCore;
using MiniValidation;

var AllowAll = "_allowAll";
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


builder.Services.AddDbContext<MinimalContextDb>(options =>
 options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: AllowAll, builder =>
    {
        builder.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});


var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

PlantController(app);
ArduinoDataController(app);
app.UseCors(AllowAll);

app.Run();

static void PlantController(WebApplication app)
{
    app.MapGet("/plant", async (
    MinimalContextDb context) =>
    await context.Plants.ToListAsync())
    .WithName("GetPlants")
    .WithTags("Plant");

    app.MapGet("/plant/{id}", async (
        MinimalContextDb context, int id) =>
            await context.Plants.FindAsync(id)
                is Plant plant ? Results.Ok(plant) : Results.NotFound()
        )
        .WithName("GetPlantById")
        .WithTags("Plant");

    app.MapPost("/plant", async (
        MinimalContextDb context, Plant plant) =>
    {
        if (!MiniValidator.TryValidate(plant, out var errors))
            return Results.ValidationProblem(errors);
        context.Plants.Add(plant);

        var result = await context.SaveChangesAsync();

        return result > 0
            ? Results.Created($"/plant/{plant.Id}", plant)
            : Results.BadRequest("There was a problem creating the plant");

    })
        .ProducesValidationProblem()
        .Produces<Plant>(StatusCodes.Status201Created)
        .Produces(StatusCodes.Status400BadRequest)
        .WithName("PostPlant")
        .WithTags("Plant");

    app.MapPut("/plant/{id}", async (
    int id, MinimalContextDb context, Plant updatedPlant) =>
    {
        if (!MiniValidator.TryValidate(updatedPlant, out var errors))
            return Results.ValidationProblem(errors);

        var existingPlant = await context.Plants.FindAsync(id);
        if (existingPlant == null)
        {
            return Results.NotFound();
        }

        existingPlant.Name = updatedPlant.Name;
        existingPlant.Humity = updatedPlant.Humity;
        existingPlant.Luminosity = updatedPlant.Luminosity;
        existingPlant.Hours = updatedPlant.Hours;

        context.Plants.Update(existingPlant);
        var result = await context.SaveChangesAsync();

        return result > 0
            ? Results.NoContent()
            : Results.BadRequest("There was a problem saving the record");

    })
.ProducesValidationProblem()
.Produces<Plant>(StatusCodes.Status204NoContent)
.Produces(StatusCodes.Status400BadRequest)
.Produces(StatusCodes.Status404NotFound)
.WithName("PutPlant")
.WithTags("Plant");

    app.MapDelete("/plant/{id}", async (
        int id, MinimalContextDb context) =>
    {
        var plant = await context.Plants.FindAsync(id);
        if (plant == null)
        {
            return Results.NotFound();
        }

        context.Plants.Remove(plant);

        var result = await context.SaveChangesAsync();

        return result > 0
            ? Results.NoContent()
            : Results.BadRequest("There was a problem deleting the record");
    })
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status404NotFound)
        .WithName("DeletePlant")
        .WithTags("Plant");

    app.MapGet("/plant/actual", async (
        MinimalContextDb context) =>
    {
        var plant = await context.Plants.FirstOrDefaultAsync(p => p.IsUsed);
        if (plant == null)
        {
            return Results.NotFound();
        }

        return Results.Ok(plant);
    })
    .WithName("GetActualPlant")
    .WithTags("Plant");

    app.MapPut("/plant/{id}/actual", async (
        int id, MinimalContextDb context) =>
    {
        var plant = await context.Plants.FindAsync(id);
        if (plant == null)
        {
            return Results.NotFound();
        }

        var actualPlant = await context.Plants.FirstOrDefaultAsync(p => p.IsUsed);
        if (actualPlant != null)
        {
            actualPlant.IsUsed = false;
            context.Plants.Update(actualPlant);
        }

        plant.IsUsed = true;
        context.Plants.Update(plant);

        var result = await context.SaveChangesAsync();

        return result > 0
            ? Results.NoContent()
            : Results.BadRequest("There was a problem saving the record");
    })
    .Produces(StatusCodes.Status204NoContent)
    .Produces(StatusCodes.Status400BadRequest)
    .Produces(StatusCodes.Status404NotFound)
    .WithName("PutActualPlant")
    .WithTags("Plant");

    
}

static void ArduinoDataController(WebApplication app)
{
    app.MapGet("/arduino", async (
        MinimalContextDb context) =>
    await context.ArduinoDatas.ToListAsync())
        .WithName("GetArduinoData")
        .WithTags("ArduinoData");

    app.MapGet("/arduino/last-modified", async (
        MinimalContextDb context) => {
            var last = await context.ArduinoDatas.OrderByDescending(x => x.Id).FirstOrDefaultAsync();
            if (last.PumpOn == true) 
            {
                var result = await context.ArduinoDatas.OrderByDescending(x => x.Id).Where(x => x.PumpOn == false).FirstOrDefaultAsync();
                if (result == null)
                {
                    return Results.BadRequest("There was a problem getting the last pump off");
                }
                return Results.Ok(result);
            }
            else
            {
                var result = await context.ArduinoDatas.OrderByDescending(x => x.Id).Where(x => x.PumpOn == true).FirstOrDefaultAsync();
                if (result == null)
                {
                    return Results.BadRequest("There was a problem getting the last pump on");
                }
                return Results.Ok(result);
            }
        })
        .WithName("GetLastArduinoDataModified")
        .WithTags("ArduinoData");

    app.MapGet("/arduino/last", async (
        MinimalContextDb context) =>
        await context.ArduinoDatas.OrderByDescending(x => x.Id).FirstOrDefaultAsync())
        .WithName("GetLastArduinoData")
        .WithTags("ArduinoData");

    app.MapGet("/arduino/{id}", async (
        int id, MinimalContextDb context) =>
        await context.ArduinoDatas.FindAsync(id)
            is ArduinoData arduinoData ? Results.Ok(arduinoData) : Results.NotFound())
        .WithName("GetArduinoDataById")
        .WithTags("ArduinoData");

    app.MapPost("/arduino", async (
        MinimalContextDb context, ArduinoData arduinoData) =>
    {
        if (!MiniValidator.TryValidate(arduinoData, out var errors))
            return Results.ValidationProblem(errors);
        context.ArduinoDatas.Add(arduinoData);

        var result = await context.SaveChangesAsync();

        return result > 0
            ? Results.Created($"/plant/{arduinoData.Id}", arduinoData)
            : Results.BadRequest("There was a problem creating the plant");

    })
        .ProducesValidationProblem()
        .Produces<Plant>(StatusCodes.Status201Created)
        .Produces(StatusCodes.Status400BadRequest)
        .WithName("PostArduinoData")
        .WithTags("ArduinoData");

    app.MapPut("/arduinodata/{id}", async (
    int id, MinimalContextDb context, ArduinoData updatedData) =>
    {
        if (!MiniValidator.TryValidate(updatedData, out var errors))
            return Results.ValidationProblem(errors);

        var existingData = await context.ArduinoDatas.FindAsync(id);
        if (existingData == null)
        {
            return Results.NotFound();
        }

        // Update the existing ArduinoData object with the data from the updatedData object
        existingData.Humity = updatedData.Humity;
        existingData.Luminosity = updatedData.Luminosity;
        existingData.Time = updatedData.Time;
        existingData.PumpOn = updatedData.PumpOn;
        existingData.LightOn = updatedData.LightOn;

        context.ArduinoDatas.Update(existingData);
        var result = await context.SaveChangesAsync();

        return result > 0
            ? Results.NoContent()
            : Results.BadRequest("There was a problem saving the record");

    })
        .ProducesValidationProblem()
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status404NotFound)
        .WithName("PutArduinoData")
        .WithTags("ArduinoData");

    app.MapGet("/arduinodata/plant/{id}", async (
        int id, MinimalContextDb context) =>
    {
        var plant = await context.Plants.FindAsync(id);
        if (plant == null)
        {
            return Results.NotFound();
        }

        var arduinoData = await context.ArduinoDatas.Where(x => x.PlantId == id).ToListAsync();
        if (arduinoData == null)
        {
            return Results.NotFound();
        }

        return Results.Ok(arduinoData);
    })
        .WithName("GetArduinoDataByPlantId")
        .WithTags("ArduinoData")
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound);


    app.MapGet("/arduinodata/plant/{id}/last", async( 
        int id, MinimalContextDb context) =>
    {
        var plant = await context.Plants.FindAsync(id);
        if (plant == null)
        {
            return Results.NotFound();
        }

        var arduinoData = await context.ArduinoDatas.Where(x => x.PlantId == id).OrderByDescending(x => x.Id).FirstOrDefaultAsync();
        if (arduinoData == null)
        {
            return Results.NotFound();
        }

        return Results.Ok(arduinoData);
    })
        .WithName("GetLastArduinoDataByPlantId")
        .WithTags("ArduinoData")
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound);

    app.MapDelete("/arduinodata/{id}", async (
        int id, MinimalContextDb context) =>
    {
        var arduinoData = await context.ArduinoDatas.FindAsync(id);
        if (arduinoData == null)
        {
            return Results.NotFound();
        }

        context.ArduinoDatas.Remove(arduinoData);

        var result = await context.SaveChangesAsync();

        return result > 0
            ? Results.NoContent()
            : Results.BadRequest("There was a problem deleting the record");
    })
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status404NotFound)
        .WithName("DeleteArduinoData")
        .WithTags("ArduinoData");
}