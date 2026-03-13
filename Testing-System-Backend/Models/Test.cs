using System;

namespace Testing_System_Backend.Models
{
    public class Test
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public DateTime Date { get; set; }
        public int Duration { get; set; } // in minutes
        public int QuestionsCount { get; set; }
        public string Status { get; set; } // "Live", "Draft", "Archived"
        public string AccessKey { get; set; }

        // Optional: Agar aap isay kisi Job ke sath link karna chahte hain
        public int? JobId { get; set; }
    }
}