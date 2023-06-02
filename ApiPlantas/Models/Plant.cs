namespace ApiPlantas.Models
{
    public class Plant
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public double Humity { get; set; }
        public double Luminosity { get; set; }
        public double Hours { get; set; }
        public bool IsUsed { get; set; }
    }
}
