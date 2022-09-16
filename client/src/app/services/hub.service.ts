import { Injectable } from "@angular/core";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { environment } from "src/environments/environment";
import { ApiPaths } from "../shared/dto/ApiPaths.enum";

@Injectable({
    providedIn: 'root'
})
export class HubService {
    public hubConnection!: HubConnection;
    url = environment.baseUrl + ApiPaths.chat;

    privateMessages: string[] = [];

    username = '';
    private token = '';

    localStorageProfile: any;

    public startConnection() {
        this.localStorageProfile = localStorage.getItem('user_profile');

        this.hubConnection = new HubConnectionBuilder()
            .withUrl(this.token ? `${this.url}?access_token=${this.token}` : `${this.url}?localStorageProfile=${this.localStorageProfile}`)
            .build();
            
        this.hubConnection
            .start()    
            .then(() => {
                this.hubConnection
                    .invoke('GetConnectionId')
                    .catch(err => console.error(`error is from here ${err}`));
            })
            .catch((err: any) => console.log('Error while establishing connection :('));


        // this.hubConnection
        //     .on('SendMessageToUser', (receiverName: string, receiverConnectionId: string, privateMessage: string, senderName: string) => {
        //     const text = `${senderName}: ${privateMessage}`;
        //     this.privateMessages = [...this.privateMessages, text]
        // });
    }

    public setToken() {
        this.token = localStorage.getItem('token')?.toString()!;
    }
}