using API.Models.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("[controller]")]
    public class AnonymousUserController : ControllerBase
    {
        private readonly IUserProfileService _userService;

        public AnonymousUserController(IUserProfileService userService)
        {
            this._userService = userService;
        }
        
        [HttpGet("getAllImages")]
        [AllowAnonymous]
        public async Task<ActionResult> GetAllImages()
        {
            var result = await _userService.GetFreeImagesUrls();

            return Ok(result);
        }
    }
}