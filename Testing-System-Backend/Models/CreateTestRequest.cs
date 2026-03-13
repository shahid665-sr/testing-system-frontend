using static Testing_System_Backend.Controllers.AdminTestsController;

namespace Testing_System_Backend.Models
{
    public class CreateTestRequest
    {
        public int? JobId { get; set; }

        // 🟢 YEH NAYE FIELDS ADD KIYE HAIN
        public string Title { get; set; }
        public System.DateTime Date { get; set; }
        public int Duration { get; set; }
        public int QuestionsCount { get; set; }
    }
}
