using System;

namespace Testing_System_Backend.Models
{
    public class CreateJobRequest
    {
        public string Title { get; set; }
        public string Department { get; set; }
        public string Location { get; set; }
        public string Type { get; set; }
        public string Salary { get; set; }
        public string Education { get; set; }
        public int Positions { get; set; }
        public DateTime LastDate { get; set; }
        public string Description { get; set; }
        public string Requirements { get; set; }
        public string Benefits { get; set; }
    }
}