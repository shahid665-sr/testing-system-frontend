namespace Testing_System_Backend.Models
{
    public class Application
    {
        public int Id { get; set; }

        // Foreign Keys
        public int UserId { get; set; }
        public User User { get; set; }

        public int JobId { get; set; }
        public Job Job { get; set; }

        public DateTime AppliedDate { get; set; } = DateTime.UtcNow;
        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected
    }
}