namespace Testing_System_Backend.Models
{
    public enum UserRole
    {
        Admin,
        Candidate
    }

    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; } // React: name
        public string FatherName { get; set; } // React: fatherName
        public string CNIC { get; set; } // React: cnic
        public string Email { get; set; } // React: email
        public string PhoneNumber { get; set; } // React: phoneNumber
        public string City { get; set; } // React: city
        public string PasswordHash { get; set; } // Secure version of password

        // 2. Role Property Add Ki (Default: Candidate)
        public UserRole Role { get; set; } = UserRole.Candidate;

        public List<Education> Educations { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}