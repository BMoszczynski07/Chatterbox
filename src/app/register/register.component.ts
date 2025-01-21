import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PassRequirementsComponent } from '../pass-requirements/pass-requirements.component';
import { RecaptchaModule } from 'ng-recaptcha';
import { BackendUrlService } from '../backend-url.service';
import { Notification } from '../../notification/Notification';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    RouterModule,
    PassRequirementsComponent,
    ReactiveFormsModule,
    RecaptchaModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  constructor(
    private readonly backendUrlService: BackendUrlService,
    private readonly router: Router
  ) {}

  public passRequirements: boolean = false;

  // protected registerFormGroup = new FormGroup({
  //   login: new FormControl<string>('', { nonNullable: true }),
  //   firstName: new FormControl<string>('', { nonNullable: true }),
  //   lastName: new FormControl<string>('', { nonNullable: true }),
  //   email: new FormControl<string>('', { nonNullable: true }),
  //   password: new FormControl<string>('', { nonNullable: true }),
  //   confirmPassword: new FormControl<string>('', { nonNullable: true }),
  // });

  protected registerFormGroup = {
    unique_id: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  public err = '';

  handleCheckLogin(): boolean {
    const uniqueId = this.registerFormGroup.unique_id;

    const alphanumericRegex = /^[a-zA-Z0-9]+$/;

    if (!alphanumericRegex.test(uniqueId)) {
      return false;
    }

    return true;
  }

  async handleUserRegister(e: Event) {
    e.preventDefault();

    this.err = '';

    if (
      !this.registerFormGroup.unique_id ||
      !this.registerFormGroup.firstName ||
      !this.registerFormGroup.lastName ||
      !this.registerFormGroup.email ||
      !this.registerFormGroup.password ||
      !this.registerFormGroup.confirmPassword
    ) {
      this.err = 'All fields are required';
      return;
    }

    const passRequirements = {
      enoughLetters: this.registerFormGroup.password.length >= 8,
      hasUppercase:
        this.registerFormGroup.password !==
        this.registerFormGroup.password.toLowerCase(),
      hasLowercase:
        this.registerFormGroup.password !==
        this.registerFormGroup.password.toUpperCase(),
      specialCharacter: /[!@#\$%\^\&*\)\(+=._-]/.test(
        this.registerFormGroup.password
      ),
    };

    if (
      !passRequirements.enoughLetters ||
      !passRequirements.hasLowercase ||
      !passRequirements.hasUppercase ||
      !passRequirements.specialCharacter
    ) {
      this.err = 'Password requirements not met';
      return;
    }

    if (
      !this.registerFormGroup.email.includes('@') ||
      !this.registerFormGroup.email.includes('.')
    ) {
      this.err = 'Invalid email';
      return;
    }

    if (!this.handleCheckLogin()) {
      this.err = 'Invalid login (only alphanumeric characters)';
      return;
    }

    if (
      this.registerFormGroup.password !== this.registerFormGroup.confirmPassword
    ) {
      this.err = 'Passwords do not match';
      return;
    }

    try {
      const findUserRequest = await fetch(
        `${this.backendUrlService.backendURL}/user/find`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            unique_id: this.registerFormGroup.unique_id,
            email: this.registerFormGroup.email,
          }),
        }
      );

      if (findUserRequest.status === 404) {
        // form validation
        try {
          const registerRequest = await fetch(
            `${this.backendUrlService.backendURL}/user/register`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                unique_id: this.registerFormGroup.unique_id,
                firstName: this.registerFormGroup.firstName,
                lastName: this.registerFormGroup.lastName,
                email: this.registerFormGroup.email,
                password: this.registerFormGroup.password,
              }),
            }
          );

          if (!registerRequest.ok) {
            throw new Error(await registerRequest.text());
          }

          const registerResponse = await registerRequest.json();

          this.router.navigate(['/login']);

          const registerNotification = new Notification(
            registerResponse.message
          );

          registerNotification.handleCreate();
        } catch (e: any) {
          this.err = e.message;
          return;
        }
        return;
      }

      const findUserResponse = await findUserRequest.json();

      if (!findUserRequest.ok) {
        throw new Error(findUserResponse.message);
      }

      console.log(findUserResponse);

      this.err = 'User already exists';
      return;
    } catch (e: any) {
      this.err = e.message;
      return;
    }
  }
}
