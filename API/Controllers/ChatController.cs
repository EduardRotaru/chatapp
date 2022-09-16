using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ChatController : ControllerBase
    {
        [HttpGet("getusername")]
        public IActionResult GetUsername()
        {
            // var username = HttpContext.Items["username"].ToString();

            var rand = new Random();
            var number = rand.Next(1, 10);

            return Ok();
        }
    }
}