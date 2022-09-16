using System.IdentityModel.Tokens.Jwt;
using System.Text;
using API.DAL;
using API.DTO;
using API.Hubs;
using API.Models.Contracts;
using API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Logging;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;

namespace API.Helpers
{
    public static class Extensions
    {
        public static void AddApplicationError(this HttpResponse response, string message)
        {
            response.Headers.Add("Application-Error", message);
            response.Headers.Add("Access-Control-Expose-Headers", "Application-Error");
            response.Headers.Add("Access-Control-Allow-Origin", "*");
        }

        public static IServiceCollection CorsServicesExtensions(this IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddPolicy("f",
                    builder => builder
                        .AllowAnyMethod()
                        .AllowCredentials()
                        .AllowAnyHeader()
                    );

            });

            return services;
        }

        public static IServiceCollection DatabaseContextExtensions(this IServiceCollection services, IConfiguration config)
        {
            var usersConnectionString = config.GetConnectionString("UsersConnection");
            services.AddDbContext<UserDbContext>(options => options.UseSqlServer(usersConnectionString));

            return services;
        }

        public static IServiceCollection ApplicationExtensions(this IServiceCollection services, IConfiguration config)
        {
            IdentityModelEventSource.ShowPII = true;

            services.Configure<CloudinarySettings>(config.GetSection("CloudinarySettings"));

            services.AddScoped<IAuthService, AuthService>();
            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            services.AddScoped<IUserProfileService, UserProfileService>();
            services.AddScoped<ITokenService, TokenService>();

            var appSettings = config.GetSection("AppSettings");
            services.Configure<AppSettings>(appSettings);

            services.AddControllers().AddNewtonsoftJson(options =>
                options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
            );
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen();

            services.AddSignalR(options =>
            {
                options.EnableDetailedErrors = true;
                options.AddFilter<HubFilter>();
            });

             services.AddSingleton<HubFilter>();

            services.AddAutoMapper(typeof(MappingProfiles));

            return services;
        }

        public static IServiceCollection AuthenticationExtentions(this IServiceCollection services, IConfiguration config)
        {
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(options =>
              {
                    // options.Authority = "ioaneduard-001-site1.btempurl.com";
                  options.Authority = "https://localhost:5001/";
                //   options.Authority = "http://192.168.0.103:8080";
                  options.Configuration = new OpenIdConnectConfiguration();
                  options.TokenValidationParameters = new TokenValidationParameters
                  {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(config.GetValue<string>("AppSettings:Secret"))),
                        ValidateIssuer = false,
                        ValidateAudience = false,
                        ClockSkew = TimeSpan.Zero
                  };
                  options.Events = new JwtBearerEvents
                  {
                      OnMessageReceived = context =>
                      {
                          var accessToken = context.Request.Query["access_token"];

                          var hasProfileOnLocalStorage = context.Request.Query["localStorageProfile"];
                          context.HttpContext.Items["localStorageProfile"] = hasProfileOnLocalStorage;

                          var path = context.HttpContext.Request.Path;
                          if (!string.IsNullOrEmpty(accessToken) &&
                              (path.StartsWithSegments("/chathub")))
                          {
                              try
                              {
                                  var tokenHandler = new JwtSecurityTokenHandler();
                                  var key = Encoding.ASCII.GetBytes(config.GetValue<string>("AppSettings:Secret"));
                                  tokenHandler.ValidateToken(accessToken, new TokenValidationParameters
                                  {
                                      ValidateIssuerSigningKey = true,
                                      IssuerSigningKey = new SymmetricSecurityKey(key),
                                      ValidateIssuer = false,
                                      ValidateAudience = false,
                                      ClockSkew = TimeSpan.Zero
                                  }, out SecurityToken validatedToken);

                                  var jwtToken = (JwtSecurityToken)validatedToken;

                                  var id = jwtToken.Claims.First(x => x.Type == "nameid").Value;
                                  var username = jwtToken.Claims.First(x => x.Type == "unique_name").Value;

                                  context.HttpContext.Items["id"] = id;
                                  context.HttpContext.Items["username"] = username;
                                  context.HttpContext.Items["tokenIsValid"] = true;
                              }
                              catch
                              {
                                  throw new Exception("token invalid");
                              }
                          }
                          else
                          {
                              context.HttpContext.Items["tokenIsValid"] = false;
                          }

                          return Task.CompletedTask;
                      }
                  };
              });

            return services;
        }
    }
}