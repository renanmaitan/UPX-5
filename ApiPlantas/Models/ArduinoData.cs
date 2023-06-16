namespace ApiPlantas.Models
{
    public class ArduinoData
    {
        public int Id { get; set; }
        public double Humity { get; set; }
        public double Luminosity { get; set; }
        public DateTime Time { get; set; }
        public bool PumpOn { get; set; }
        public bool LightOn { get; set; }
        public int PlantId { get; set; }
    }
}
