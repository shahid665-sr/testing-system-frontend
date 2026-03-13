using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Testing_System_Backend.Data;
using Testing_System_Backend.Models;

namespace Testing_System_Backend.Controllers
{
 
    [ApiController]
    [Route("api/admin/[controller]")]
    public class QuestionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public QuestionsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. GET ALL QUESTIONS
        [HttpGet]
        public async Task<ActionResult<IEnumerable<QuestionResponseDto>>> GetQuestions()
        {
            var questions = await _context.Questions
                .OrderByDescending(q => q.CreatedAt)
                .Select(q => new QuestionResponseDto
                {
                    Id = q.Id,
                    Text = q.Text,
                    Category = q.Category,
                    Difficulty = q.Difficulty,
                    Correct = q.CorrectOption,
                    CorrectText = q.CorrectOption.ToUpper() == "A" ? q.OptionA :
                                  q.CorrectOption.ToUpper() == "B" ? q.OptionB :
                                  q.CorrectOption.ToUpper() == "C" ? q.OptionC : q.OptionD,
                    Options = new List<string> { q.OptionA, q.OptionB, q.OptionC, q.OptionD }
                })
                .ToListAsync();

            return Ok(questions);
        }

        // 2. CREATE QUESTION 
        [HttpPost]
        public async Task<IActionResult> CreateQuestion([FromBody] QuestionCreateDto dto)
        {
            var newQuestion = new Question
            {
                Text = dto.Text,
                Category = dto.Category,
                Difficulty = dto.Difficulty,
                OptionA = dto.OptionA,
                OptionB = dto.OptionB,
                OptionC = dto.OptionC,
                OptionD = dto.OptionD,
                CorrectOption = dto.CorrectOption
            };

            _context.Questions.Add(newQuestion);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Question added successfully!" });
        }

        // 3. UPDATE QUESTION 
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateQuestion(int id, [FromBody] QuestionUpdateDto dto)
        {
            var question = await _context.Questions.FindAsync(id);
            if (question == null) return NotFound(new { message = "Question not found." });

            question.Text = dto.Text;
            question.Category = dto.Category;
            question.Difficulty = dto.Difficulty;
            question.OptionA = dto.OptionA;
            question.OptionB = dto.OptionB;
            question.OptionC = dto.OptionC;
            question.OptionD = dto.OptionD;
            question.CorrectOption = dto.CorrectOption;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Question updated successfully." });
        }

        // 4. DELETE QUESTION (Yeh miss ho gaya tha)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteQuestion(int id)
        {
            var question = await _context.Questions.FindAsync(id);
            if (question == null) return NotFound();

            _context.Questions.Remove(question);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Question deleted successfully." });
        }
        // 5. IMPORT QUESTIONS VIA CSV
        [HttpPost("import")]
        public async Task<IActionResult> ImportQuestions(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "Please upload a valid CSV file." });

            var newQuestions = new List<Question>();

            try
            {
                using (var stream = new StreamReader(file.OpenReadStream()))
                {
                    // Pehli line (Headers) ko ignore karne ke liye
                    var headerLine = await stream.ReadLineAsync();

                    while (!stream.EndOfStream)
                    {
                        var line = await stream.ReadLineAsync();
                        if (string.IsNullOrWhiteSpace(line)) continue;

                        // CSV values ko split karein (Dhyan rakhein text mein comma na ho, ya proper CSV parser use karein)
                        var values = line.Split(',');

                        // Expected CSV Format: Text, Category, Difficulty, OptionA, OptionB, OptionC, OptionD, CorrectOption
                        if (values.Length >= 8)
                        {
                            newQuestions.Add(new Question
                            {
                                Text = values[0].Trim(),
                                Category = values[1].Trim(),
                                Difficulty = values[2].Trim(),
                                OptionA = values[3].Trim(),
                                OptionB = values[4].Trim(),
                                OptionC = values[5].Trim(),
                                OptionD = values[6].Trim(),
                                CorrectOption = values[7].Trim().ToUpper() // A, B, C, or D
                            });
                        }
                    }
                }

                if (newQuestions.Count > 0)
                {
                    await _context.Questions.AddRangeAsync(newQuestions);
                    await _context.SaveChangesAsync();
                    return Ok(new { message = $"{newQuestions.Count} questions imported successfully!" });
                }

                return BadRequest(new { message = "No valid questions found in the file." });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Error importing file", error = ex.Message });
            }
        }
    }
}