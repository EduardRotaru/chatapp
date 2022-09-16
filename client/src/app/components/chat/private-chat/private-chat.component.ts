import { Component, ComponentFactoryResolver, ComponentRef, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { HubConnection } from '@microsoft/signalr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/services/auth.service';
import { HubService } from 'src/app/services/hub.service';
import { LoginComponent } from '../../auth/login/login.component';
import { ChatComponent } from '../chat.component';

@Component({
  selector: 'app-private-chat',
  templateUrl: './private-chat.component.html',
  styleUrls: ['./private-chat.component.scss']
})
export class PrivateChatComponent implements OnInit, OnDestroy {
  receiverConnectionId!: string;
  receiverName!: string;

  senderConnectionId!: string;
  senderName!: string;

  messageSendBy: string = '';
  clientConnectionId: string = '';
  privateMessage = '';
  privateMessages: {
    img: any,
    message: string
  }[] = [];
  responseConnectionId: string = '';
  responseName: string = '';
  isResponse: boolean = true;
  visible: boolean = false;
  tabName: string = '';

  componentIndex: number = 0;

  public textArea: string = '';
  public isEmojiPickerVisible: boolean = false;

  mapEmoji = {
    '%demon%': '👹',
    '%angry%': '🤬',
    '%shit%': '💩',
    '%clown%': '🤡'
  };

  hubConnection!: HubConnection;
  enabledLastTabIndex: number = 0;
  componentRefTabs: { component: ComponentRef<PrivateChatComponent>, visible: boolean }[]
    = [] as { component: ComponentRef<PrivateChatComponent>, visible: boolean }[];

  constructor(private hubService: HubService, private modalService: NgbModal,
    public authService: AuthService, private chatComponent: ChatComponent) {
  }

  ngOnDestroy(): void {
    console.log('destroyed');
  }

  ngOnInit(): void {
  }

  sendPrivateMessage() {
    if (this.isResponse) {
      this.receiverConnectionId = this.responseConnectionId;
      this.receiverName = this.responseName;
    }

    this.hubService.hubConnection
      .invoke('SendMessageToUser', this.receiverName, this.receiverConnectionId, this.senderConnectionId, this.privateMessage, this.senderName)
      .catch(err => console.error(err))
      .finally(
        () => {
          const text = `${this.senderName}: ${this.privateMessage}`;
          this.privateMessages.push({ message: text, img: '' });
          this.privateMessage = '';
        }
      )
  }

  editTextareaMessage() {
    for (let i in this.mapEmoji) {
      let regex = new RegExp(this.escapeSpecialChars(i), 'gim');
      this.privateMessage = this.privateMessage = this.privateMessage.replace(regex, (this.mapEmoji as any)[i]);
    }
  }

  insertEmojiInMessage(emoji: string, i: number) {
    this.privateMessage = this.privateMessage = this.privateMessage + `${emoji}`;
    this.editTextareaMessage();
  }

  openLogin() {
    const modalRef = this.modalService.open(LoginComponent);
  }

  logout() {
    this.authService.logout();
  }

  openTab(i: any) {
    if (this.chatComponent.enabledLastTabIndex !== i) {
      this.chatComponent.openTab(i);
      this.visible = false;
    }
  }

  destroyTab(i: any) {}

  selectMain() {
    this.chatComponent.rootChatOpen = true;
    this.visible = false;
  }

  private escapeSpecialChars(regex: any) {
    return regex.replace(/([()[{*+.$^\\|?])/g, '\\$1');
    /* #endregion */
  }

  // openComponent() {
  //   this.helperService.emitComponentIndex(this.componentIndex);
  // }
}