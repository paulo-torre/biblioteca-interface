import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  registerForm: FormGroup = this.fb.group({
    username: ['', [
      Validators.required, 
      Validators.minLength(3),
      Validators.pattern(/^[a-zA-Z0-9._-]+$/) 
    ]],
    email: ['', [
      Validators.required, 
      Validators.email
    ]],
    password: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(20),
      Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[_.\-@!#$%&*])[A-Za-z\d_.\-@!#$%&*]+$/)
    ]]
  });

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched(); 
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(this.registerForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Cadastro realizado! Verifique seu e-mail para confirmar o código.';
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.detail || 'Ocorreu um erro ao realizar o cadastro.';
      }
    });
  }

  get f() {
    return this.registerForm.controls;
  }
}