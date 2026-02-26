namespace Testing_System_Backend.Models
{
    public class Question
    {
        public int Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty; // e.g., "English", "Computer"
        public string Difficulty { get; set; } = string.Empty; // "Easy", "Medium", "Hard"

        // Options database mein alag columns banenge
        public string OptionA { get; set; } = string.Empty;
        public string OptionB { get; set; } = string.Empty;
        public string OptionC { get; set; } = string.Empty;
        public string OptionD { get; set; } = string.Empty;

        public string CorrectOption { get; set; } = string.Empty; // Sirf "A", "B", "C", ya "D" save hoga
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}