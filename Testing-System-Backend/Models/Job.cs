namespace Testing_System_Backend.Models
{
    public class Job
    {
        public int Id { get; set; }
        public string Title { get; set; } // e.g., Junior Clerk (BPS-11)
        public string Department { get; set; } // e.g., Education Dept
        public string Description { get; set; }
        public DateTime LastDateToApply { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}