using API.DAL;
using API.Helpers;
using API.Middleware;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

var builder = WebApplication.CreateBuilder(args);

builder.Services.CorsServicesExtensions();
builder.Services.DatabaseContextExtensions(builder.Configuration);
builder.Services.ApplicationExtensions(builder.Configuration);
builder.Services.AuthenticationExtentions(builder.Configuration);

builder.Services.AddCors(options => options.AddPolicy("CorsPolicy",
        builder =>
        {
            builder.AllowAnyHeader()
                   .AllowAnyMethod()
                   .SetIsOriginAllowed((host) => true)
                   .AllowCredentials();
        }));

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var service = scope.ServiceProvider;

    var context = service.GetRequiredService<UserDbContext>();
    var canConnect = context.Database.CanConnect();
    if (!canConnect)
        context.Database.Migrate();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.Use(async (context, next) =>
// {
//     await next();

//     if (context.Response.StatusCode == 404 && !Path.HasExtension(context.Request.Path.Value))
//     {
//         context.Request.Path = "/index.html";
//         await next();
//     }
// });

// app.UseDefaultFiles();
// app.UseStaticFiles();

app.UseMiddleware<ExceptionMiddleware>();
// app.UseExceptionHandler(builder =>
// {
//     builder.Run(async context =>
//     {
//         context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

//         var error = context.Features.Get<IExceptionHandlerFeature>();
//         if (error != null)
//         {
//             // context.Response.AddApplicationError(error.Error.Message);
//             // context.Response.AddApplicationError(error.Error.StackTrace);
//             // context.Response.AddApplicationError(error.Error.Source);

//             // await context.Response.WriteAsync(error.Error.Message);
//             // await context.Response.WriteAsync(error.Error.StackTrace);
//             // await context.Response.WriteAsync(error.Error.Source);
//         }
//     });
// });

app.UseHttpsRedirection();

app.UseRouting();

app.UseCors("CorsPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.UseEndpoints(endpoints =>
{
    app.MapControllers();
    endpoints.MapHub<ChatHub>("chathub");
});

app.Run();