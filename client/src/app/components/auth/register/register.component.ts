import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  @Output() cancelRegister = new EventEmitter();
  registerForm!: FormGroup;
  validationErrors: string[] = [];

  constructor(private authService: AuthService, 
    private fb: FormBuilder, private router: Router, public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
    this.intitializeForm();
  }

  get username(){
    return this.registerForm.controls["username"] as FormControl;
  }

  get email(){
    return this.registerForm.controls["email"] as AbstractControl;
  }

  get password() {
    return this.registerForm.controls["password"] as AbstractControl;
  }

  get confirmPassword() {
    return this.registerForm.controls["confirmPassword"] as AbstractControl;
  }

  intitializeForm() {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', [Validators.required, 
        Validators.minLength(3), Validators.maxLength(8)]],
      confirmPassword: ['', [Validators.required]]
    })
  }

  onPasswordChange() {
    if (this.confirmPassword.value == this.password.value) {
      this.confirmPassword.setErrors(null);
    } else {
      this.confirmPassword.setErrors({ mismatch: true });
    }
    console.log(this.registerForm.errors)
  }

  register() {
    let profile = JSON.parse(localStorage.getItem('user_profile')!);

    this.authService.register({...this.registerForm.value, ...profile}).subscribe((response: any) => {

    }, (error: string[]) => {
      this.validationErrors = error;
    },() => {
      this.activeModal.dismiss();
    })
  }

  cancel() {
    this.cancelRegister.emit(false);
    this.activeModal.dismiss();
  }
}


