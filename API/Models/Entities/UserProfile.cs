namespace API.Models.Entities
{
    public class UserProfile
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string PhotoUrl { get; set; }
        public string PublicId { get; set; }
        public User User { get; set; }
    }
}