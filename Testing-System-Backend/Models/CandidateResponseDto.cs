namespace Testing_System_Backend.Models
{
    public class CandidateResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string CNIC { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
        public int? Score { get; set; }
        public string Date { get; set; } = string.Empty;
    }
    public class CandidateUpdateDto
    {
        public string Name { get; set; } = string.Empty;
        public string CNIC { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
    }
}
