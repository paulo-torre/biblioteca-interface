import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private passwordSub?: Subscription;

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

  hidePassword = true; 
  passwordStrength = 0; 
  passwordTracks = {
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false
  };

  ngOnInit(): void {
    this.passwordSub = this.registerForm.get('password')?.valueChanges.subscribe(value => {
      this.checkPasswordStrength(value || '');
    });
  }

  ngOnDestroy(): void {
    if (this.passwordSub) {
      this.passwordSub.unsubscribe();
    }
  }

  checkPasswordStrength(password: string): void {
    this.passwordTracks.hasMinLength = password.length >= 8 && password.length <= 20;
    this.passwordTracks.hasUppercase = /[A-Z]/.test(password);
    this.passwordTracks.hasLowercase = /[a-z]/.test(password);
    this.passwordTracks.hasNumber = /[0-9]/.test(password);
    this.passwordTracks.hasSpecial = /[_.\-@!#$%&*]/.test(password);

    this.passwordStrength = Object.values(this.passwordTracks).filter(Boolean).length;
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  get strengthColorClass(): string {
    if (this.passwordStrength <= 2) return 'weak';
    if (this.passwordStrength <= 4) return 'medium';
    return 'strong';
  }

  get strengthText(): string {
    if (this.passwordStrength === 0) return 'Digite uma senha segura';
    if (this.passwordStrength <= 2) return 'Senha vulnerável ou fraca ';
    if (this.passwordStrength <= 4) return 'Senha de segurança média';
    return 'Senha Segura';
  }

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