using BCrypt.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Testing_System_Backend.Data;
using Testing_System_Backend.Models;
using System.Security.Claims; // Naya add kiya JWT ke liye
using Microsoft.IdentityModel.Tokens; // Naya add kiya
using System.IdentityModel.Tokens.Jwt; // Naya add kiya
using System.Text; // Naya add kiya

namespace TestingSystemBeckend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly IConfiguration _configuration; // JWT key ke liye add kiya

        // Constructor Injection
        public AuthController(ApplicationDbContext context, IWebHostEnvironment environment, IConfiguration configuration)
        {
            _context = context;
            _environment = environment;
            _configuration = configuration;
        }

        // 1. REGISTER API (Aapka code bilkul same hai)
        
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromForm] RegisterDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            {
                return BadRequest(new { message = "Email already exists!" });
            }

            string passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            // Naya user by default 'Candidate' banega (model ki wajah se)
            var user = new User
            {
                Name = dto.Name,
                FatherName = dto.FatherName,
                CNIC = dto.Cnic,
                Email = dto.Email,
                PhoneNumber = dto.PhoneNumber,
                City = dto.City,
                PasswordHash = passwordHash
            };

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                if (!string.IsNullOrEmpty(dto.EducationData))
                {
                    var educationList = JsonConvert.DeserializeObject<List<Education>>(dto.EducationData);
                    if (educationList != null)
                    {
                        for (int i = 0; i < educationList.Count; i++)
                        {
                            var edu = educationList[i];
                            edu.UserId = user.Id;

                            if (dto.Files != null && dto.Files.Count > i)
                            {
                                var file = dto.Files[i];
                                if (file.Length > 0)
                                {
                                    var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                                    var uploadPath = Path.Combine(_environment.ContentRootPath, "Uploads");

                                    if (!Directory.Exists(uploadPath))
                                        Directory.CreateDirectory(uploadPath);

                                    var filePath = Path.Combine(uploadPath, fileName);

                                    using (var stream = new FileStream(filePath, FileMode.Create))
                                    {
                                        await file.CopyToAsync(stream);
                                    }
                                    edu.FilePath = fileName;
                                }
                            }
                            _context.Educations.Add(edu);
                        }
                        await _context.SaveChangesAsync();
                    }
                }

                await transaction.CommitAsync();
                return Ok(new { message = "Registration Successful!", userId = user.Id });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "Registration Failed", error = ex.Message });
            }
        }

        // 2. LOGIN API (Nayi Add Ki Hai)
       
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            // 1. Find user by email
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

            // 2. Check if user exists and password is correct
            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Invalid email or password!" });
            }

            // 3. Generate JWT Token with ROLES
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"] ?? "MySuperSecretKeyForTestingSystem123456789!");

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Name, user.Name),
                    new Claim(ClaimTypes.Role, user.Role.ToString()) // <--- YAHAN ROLE ADD HUA HAI!
                }),
                Expires = DateTime.UtcNow.AddHours(3), // Token 3 ghante baad expire hoga
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            // 4. Return Token and Role to Frontend
            return Ok(new
            {
                message = "Login Successful",
                token = tokenString,
                role = user.Role.ToString()
            });
        }
    }

    // Login ka Data lene ke liye choti si class
    public class LoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}