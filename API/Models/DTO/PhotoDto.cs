using Microsoft.AspNetCore.Http;

namespace API.Models.DTO
{
    public class PhotoDto {

        public string Url { get; set; }

        public IFormFile File {get;set;}

        public string PublicId { get; set; }
    }
}