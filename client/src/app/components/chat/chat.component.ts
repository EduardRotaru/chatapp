import { Component, ComponentFactoryResolver, ComponentRef, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { HelperService } from 'src/app/services/helper.service';
import { HubService } from 'src/app/services/hub.service';
import { PrivateChatComponent } from './private-chat/private-chat.component';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { UserProfileService } from 'src/app/services/userProfile.service';
import { AuthService } from 'src/app/services/auth.service';
import { LoginComponent } from '../auth/login/login.component';

@Component({
	selector: 'app-chat',
	templateUrl: './chat.component.html',
	styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
	closeResult = '';
	images: { 'name': string }[] = [];
	message = '';
	username = '';
	userid!: number;
	connectionId = '';
	clientConnectionId = '';
	photo: any;
	messages: {
		img: any,
		message: string
	}[] = [];
	updateProfileDto: {
		name: string,
		photoUrl: string
	} = {} as { name: string, photoUrl: string };

	privateMessages: BehaviorSubject<{
		img: any,
		message: string
	}> = new BehaviorSubject<{
		img: any,
		message: string
	}>(null as any);

	privateChats: string[] = []
	photoBackend: any;

	connections: { [key: string]: Array<string> } = {};

	componentRef!: ComponentRef<PrivateChatComponent>;
	componentRefTabs: { component: ComponentRef<PrivateChatComponent>, visible: boolean }[]
		= [] as { component: ComponentRef<PrivateChatComponent>, visible: boolean }[];

	enabledLastTabIndex: number = 0;

	publicIdPhotoToDelete: string = '';

	public textArea: string = '';
	public isEmojiPickerVisible: boolean = false;

	tabName = '';

	mapEmoji = {
		'%demon%': '👹',
		'%angry%': '🤬',
		'%shit%': '💩',
		'%clown%': '🤡'
	};

	@ViewChild('componentHolder', { read: ViewContainerRef }) componentHolder!: ViewContainerRef;

	rootChatOpen: boolean = true;

	constructor(private userService: UserProfileService,
		private modalService: NgbModal,
		public authService: AuthService,
		private hubService: HubService,
		private componentFactoryResolver: ComponentFactoryResolver,
		private helperService: HelperService) { }

	ngOnInit() {
		const userProfile = JSON.parse(localStorage.getItem('user_profile')!)
		this.userid = userProfile ? userProfile['id'] : -1;

		this.authService.isLoggedIn$.subscribe(result => {
			if (!result) this.userid === -1;
			if (result) {
				const profile = JSON.parse(localStorage.getItem('user_profile')!);
				this.setProfile(profile);
			}
		})

		this.hubService.setToken();
		this.hubService.startConnection();
		this.updateConnectionList();

		// this.helperService.data$.subscribe(index => {
		// 	this.componentRefTabs.forEach((tab: any) => {
		// 		tab.component.instance.visible = false;
		// 	});

		// 	this.componentRefTabs[index].component.instance.visible = true;
		// })
	}

	public sendMessage() {
		if (!this.connectionId) {
			this.hubService.hubConnection
				.invoke('SendMessage', this.username, this.photo, this.message)
				.catch(err => console.error(err)).finally(() => {
					this.message = '';
				});
		}
	}

	ngOnDestroy() {
		// this.componentRef.destroy();
	}

	public createNewPrivateMessageComponent(senderName: string, senderConnectionId: any): void {
		const exists = this.privateChats.includes(senderConnectionId.toString());
		if (!exists) {
			const componentFactory = this.componentFactoryResolver.resolveComponentFactory(PrivateChatComponent);
			this.componentRef = this.componentHolder.createComponent(componentFactory);

			this.componentRef.instance.receiverConnectionId = senderConnectionId.toString();
			this.componentRef.instance.receiverName = senderName;

			this.componentRef.instance.senderConnectionId = this.clientConnectionId;
			this.componentRef.instance.senderName = this.username;

			this.componentRef.instance.isResponse = false;
			this.componentRef.instance.clientConnectionId = this.clientConnectionId;

			this.privateChats.push(senderConnectionId.toString());

			this.enabledLastTabIndex = this.componentRefTabs.push({
				component: this.componentRef,
				visible: true
			}) - 1;

			this.componentRefTabs[this.enabledLastTabIndex].component.instance.componentIndex = this.enabledLastTabIndex;
			this.componentRefTabs[this.enabledLastTabIndex].component.instance.visible = true;
			this.componentRefTabs[this.enabledLastTabIndex].component.instance.tabName = senderName;

			this.tabName = senderName;
			this.rootChatOpen = false;

			if (this.enabledLastTabIndex > 0)
				this.componentRefTabs[this.enabledLastTabIndex - 1].component.instance.visible = false;

			this.componentRef.instance.componentRefTabs = this.componentRefTabs;
		}
	}

	public openTab(i: any) {
		this.componentRefTabs[this.enabledLastTabIndex].component.instance.visible = false;
		this.componentRefTabs[i].component.instance.visible = true;
		this.enabledLastTabIndex = i;
		this.rootChatOpen = false;
	}

	selectMain() {
		if (this.enabledLastTabIndex !== -1) {
			this.enabledLastTabIndex = -1;
			this.rootChatOpen = !this.rootChatOpen;
			this.componentRefTabs[this.enabledLastTabIndex].component.instance.visible = false;
		}
	}

	destroyTab(i: any) {
		this.componentRefTabs[i].component.destroy();
		this.componentRefTabs.splice(i, 1);
	}

	private updateConnectionList() {
		this.hubService.hubConnection
			.on('SendMessage', (username: string, photoUrl: any, message: string) => {
				const text = `${username}: ${message}`;
				this.messages.push({ img: photoUrl, message: text });
			});

		this.hubService.hubConnection
			.on('SendMessageToUser', (receiverName: string, receiverConnectionId: string, senderConnectionId: string, privateMessage: string, senderName: string) => {
				const text = `${senderName}: ${privateMessage}`;
				console.log(receiverConnectionId);
				if (typeof this.componentRef === 'undefined') {
					this.createNewPrivateMessageComponent(senderName, senderConnectionId);
					this.privateChats.push(senderConnectionId.toString());
				}

				const exists = this.privateChats.includes(senderConnectionId.toString());
				if (!exists) {
					this.createNewPrivateMessageComponent(senderName, senderConnectionId);
				}

				this.componentRef.instance.privateMessages.push({ message: text, img: '' })
				this.componentRef.instance.isResponse = true;
				this.componentRef.instance.responseConnectionId = senderConnectionId;
				this.componentRef.instance.responseName = receiverName;
			});

		if (!this.hubService.localStorageProfile) {
			this.hubService.hubConnection.on('GetYourUsername', (userprofile) => {
				this.setProfile(userprofile);
				localStorage.setItem('user_profile', JSON.stringify(userprofile));
			});
		}
		else {
			const profile = JSON.parse(localStorage.getItem('user_profile')!);
			this.setProfile(profile);
		}

		this.hubService.hubConnection.on('GetConnectionId', (connectionId) => {
			this.clientConnectionId = connectionId;
			localStorage.setItem('user_profile_connectionId', JSON.stringify(connectionId));
		});

		this.hubService.hubConnection.on('UpdateConnectionsList', (connections) => {
			this.connections = connections;

			console.log(connections);
			console.log(this.connections);

			delete this.connections[this.username];
		});
	}

	openLogin() {
		const modalRef = this.modalService.open(LoginComponent);
	}

	logout() {
		this.authService.logout();
	}

	private setProfile(profile: any) {
		this.username = profile.name;
		this.userid = profile.id;
		this.photo = profile.photoUrl;

		this.publicIdPhotoToDelete = profile.imagePublicId;
	}

	/* #region  Modal stuff */
	public openModal(content: any) {
		this.userService.getAllImages().subscribe((response: any) => {
			this.images = response;
		}, (error: any) => {
			console.log(error);
		}, () => {
			this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
				this.closeResult = `Closed with: ${result}`;
			}, (reason: any) => {
				this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
			});
		})
	}

	public uploadImage(event: any) {
		this.userService.uploadImage(this.userid, event.target.files[0]).subscribe((result: any) => {
			this.photo = result['photoUrl'];
			this.publicIdPhotoToDelete = result['publicId'];
		}, (error: any) => console.log(error),
			() => {
				this.deleteCloudPicture();
			}
		);
	}

	public updateImage(imageUrl: any) {
		this.photo = imageUrl;
		this.updateProfileDto.photoUrl = this.photo;

		this.deleteCloudPicture();
	}

	public saveProfile() {
		this.updateProfileDto = {
			name: this.username,
			photoUrl: this.photo
		}

		let profile = JSON.parse(localStorage.getItem('user_profile')!);
		if (profile.id > 1) {
			this.userService.editUserProfile(this.userid, this.updateProfileDto).subscribe((result: any) => {
				profile.id = result.id;
				profile.imagePublicId = result.publicId;
				profile.name = result.name;
				profile.photoUrl = result.photoUrl;
				localStorage.setItem('user_profile', JSON.stringify(profile))
			}, (error: any) => {
				console.log(error);
			}, () => {

			});
		}
		else {
			let oldName = profile.name;
			profile.name = this.updateProfileDto.name;
			profile.photoUrl = this.updateProfileDto.photoUrl;
			localStorage.setItem('user_profile', JSON.stringify(profile))
			console.log(this.connections);

			this.hubService.hubConnection
				.invoke('UpdateUserConnectionKey', this.connectionId, oldName, this.updateProfileDto.name)
				.catch(err => console.error(err)).finally(() => {
					console.log('connection Key updated')
				});
		}

		this.modalService.dismissAll();
	}

	private getDismissReason(reason: any): string {
		if (reason === ModalDismissReasons.ESC) {
			return 'by pressing ESC';
		} else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
			return 'by clicking on a backdrop';
		} else {
			return `with: ${reason}`;
		}
	}

	private deleteCloudPicture() {
		if (this.publicIdPhotoToDelete)
			if (!this.publicIdPhotoToDelete.includes("assets/")) {
				this.userService.deleteImage(this.userid, this.publicIdPhotoToDelete).subscribe((result: any) => {
				}, (error: any) => {
					console.log(error)
				}, () => {
					// this.publicIdPhotoToDelete = this.photo;
				})
			}
	}
	/* #endregion */

	/* #region  Emoticons */
	editTextareaMessage() {
		for (let i in this.mapEmoji) {
			let regex = new RegExp(this.escapeSpecialChars(i), 'gim');
			this.message = this.message = this.message.replace(regex, (this.mapEmoji as any)[i]);
		}
	}

	insertEmojiInMessage(emoji: string, i: number) {
		this.message = this.message = this.message + `${emoji}`;
		this.editTextareaMessage();
	}

	private escapeSpecialChars(regex: any) {
		return regex.replace(/([()[{*+.$^\\|?])/g, '\\$1');
		/* #endregion */
	}
}