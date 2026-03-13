using static Testing_System_Backend.Controllers.AdminTestsController;

namespace Testing_System_Backend.Models
{
    public class CreateTestRequest
    {
        public int JobId { get; set; }
        public int Duration { get; set; }
        public int PassingMarks { get; set; }
        public List<TestRuleDto> Rules { get; set; }
    }
}
