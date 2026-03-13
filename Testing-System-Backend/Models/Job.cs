using System;

namespace Testing_System_Backend.Models
{
    public class Job
    {
        public int Id { get; set; }
        public string Title { get; set; } // e.g., Junior Clerk (BPS-11)
        public string Department { get; set; } // e.g., Education Dept
        public string Description { get; set; }

        // 🟢 Naye Fields Frontend ke mutabiq
        public string Location { get; set; }
        public string Type { get; set; } // Full-time, Contract etc.
        public string Salary { get; set; }
        public string Education { get; set; }
        public int Positions { get; set; } // Vacancies

        // JSON strings ke tor par save karenge (taake lists save ho sakein)
        public string Requirements { get; set; }
        public string Benefits { get; set; }

        public DateTime LastDateToApply { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}