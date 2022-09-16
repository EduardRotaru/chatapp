import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  loggedIn!: boolean;

  constructor(private router: Router, public authService: AuthService) { }


  ngOnInit() {

    // if (!this.startup.startupData) {
    //     // assign a random username and a random photo
    //     // store it in an object along with connection list
    // }
    this.authService.isLoggedIn();
  }
}

