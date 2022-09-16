using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using API.Models.Contracts;
using API.Models.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;
using API.Helpers;
using CloudinaryDotNet;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace API.Controllers
{
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [Route("[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly IUserProfileService _userService;
        // private readonly IOptions<CloudinarySettings> _cloudinarySettings;
        // private Cloudinary _cloudinary;

        public UserController(IMapper mapper, IUserProfileService userService, IOptions<CloudinarySettings> cloudinarySettings)
        {
            _mapper = mapper;
            _userService = userService;
        }

        [HttpGet("getUserProfile/{id}")]
        public async Task<IActionResult> GetUserProfile(int id)
        {
            var user = await _userService.GetUserById(id);

            if (user == null)
                return null;

            return Ok(_mapper.Map<UserProfileDto>(user));
        }

        [HttpPut("editUserProfile/{id}")]
        public async Task<IActionResult> EditUserProfile(int id, UserProfileDto userProfileDto)
        {
            var result = await _userService.EditUserProfile(id, userProfileDto);

            // edit connection id old Key with new Key
            if (result == null) return null;

            return Ok(result);
        }

        [HttpGet("getAllImages")]
        [AllowAnonymous]
        public async Task<ActionResult> GetAllImages()
        {
            var result = await _userService.GetFreeImagesUrls();

            return Ok(result);
        }

        [HttpGet("{id}", Name = "GetPhoto")]
        public async Task<IActionResult> GetPhoto(int id)
        {
            var photo = await _userService.GetPhoto(id);

            return Ok(photo);
        }

        [Authorize]
        [HttpPost("uploadImage/{userId}")]
        public async Task<ActionResult> UploadImage(int userId, [FromForm] PhotoDto photoDto)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
            {
                return Unauthorized();
            }

            var result = await _userService.SavePhoto(userId, photoDto);

            return CreatedAtRoute("GetPhoto", new { id = userId }, result);
        }

        [Authorize]
        [HttpDelete("deleteImage/{publicIdParam}/{userId}")]
        public async Task<ActionResult> DeleteImage(string publicIdParam, int userId)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
            {
                return Unauthorized();
            }

            var result = await _userService.DeletePhoto(userId, publicIdParam);

            return Ok(result.Result);
        }
    }
}
