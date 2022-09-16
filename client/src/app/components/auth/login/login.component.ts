import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/services/auth.service';
import { HubService } from 'src/app/services/hub.service';
import { RegisterComponent } from '../register/register.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  token: string = '';
  loginModel: any = {};

  connectionId = '';
  oldName = '';

  constructor(private authService: AuthService,
    private router: Router,
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private hubService: HubService) { }

  ngOnInit(): void {
    this.connectionId = JSON.parse(localStorage.getItem('connectionId')!);
    this.oldName = JSON.parse(localStorage.getItem('user_profile')!).name;
  }

  login() {
   this.authService.login(this.loginModel).subscribe((result: any) => {
      this.hubService.hubConnection
      .invoke('UpdateUserConnectionKey', this.connectionId, this.oldName, result)
      .catch(err => console.error(err))
      .finally(() => {
        console.log('connection Key updated')
      }), (error: any) => {
        console.log(error);
      }, (() => {
        this.activeModal.dismiss();
      })
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/')
  }

  openRegister() {
    this.modalService.open(RegisterComponent);
    this.activeModal.dismiss();
  }
}
