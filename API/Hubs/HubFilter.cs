using System;
using Microsoft.AspNetCore.SignalR;

namespace API.Hubs
{
    public class HubFilter : IHubFilter
    {
        // public async ValueTask<object> InvokeMethodAsync(
        // HubInvocationContext invocationContext, Func<HubInvocationContext, ValueTask<object>> next)
        // {
        //     Console.WriteLine($"Calling hub method '{invocationContext.HubMethodName}'");
        //     try
        //     {
        //         return await next(invocationContext);
        //     }
        //     catch (Exception ex)
        //     {
        //         throw ex;
        //     }
        // }

        // // Optional method
        // public Task OnConnectedAsync(HubLifetimeContext context, Func<HubLifetimeContext, Task> next)
        // {
        //     try
        //     {
        //         return next(context);
        //     }
        //     catch (Exception ex)
        //     {
        //         throw ex;
        //     }
        // }

        // // Optional method
        // public Task OnDisconnectedAsync(
        //     HubLifetimeContext context, Exception exception, Func<HubLifetimeContext, Exception, Task> next)
        // {
        //     try
        //     {
        //         return next(context, exception);
        //     }
        //     catch (Exception ex)
        //     {
        //         throw ex;
        //     }
        // }
    }
}
