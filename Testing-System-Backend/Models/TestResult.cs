using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Testing_System_Backend.Models
{
    public class TestResult
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public int JobId { get; set; }

        [Required]
        public int Score { get; set; }

        [Required]
        public int TotalMarks { get; set; }

        // Added Status property (e.g., "Passed", "Failed")
        [Required]
        public string Status { get; set; } = string.Empty;

        // Added TestDate property
        [Required]
        public DateTime TestDate { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("UserId")]
        public virtual User? User { get; set; }

        [ForeignKey("JobId")]
        public virtual Job? Job { get; set; }
    }
}