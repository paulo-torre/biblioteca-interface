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
  private phoneSub?: Subscription;

  registerForm: FormGroup = this.fb.group({
    fullName: ['', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(80),
      Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/)
    ]],
    username: ['', [
      Validators.required, 
      Validators.minLength(3),
      Validators.maxLength(20),
      Validators.pattern(/^[a-zA-Z0-9._-]+$/) 
    ]],
    email: ['', [
      Validators.required, 
      Validators.email,
      Validators.maxLength(100)
    ]],
    phone: ['', [
      Validators.required,
      Validators.pattern(/^\(\d{2}\)\s9\d{4}-\d{4}$/)
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

    this.phoneSub = this.registerForm.get('phone')?.valueChanges.subscribe(value => {
      this.applyPhoneMask(value || '');
    });
  }

  ngOnDestroy(): void {
    if (this.passwordSub) this.passwordSub.unsubscribe();
    if (this.phoneSub) this.phoneSub.unsubscribe();
  }

  applyPhoneMask(value: string): void {
    let raw = value.replace(/\D/g, '');
    if (raw.length > 11) raw = raw.substring(0, 11);

    let masked = '';
    if (raw.length > 0) {
      masked = `(${raw.substring(0, 2)}`;
      if (raw.length > 2) {
        masked += `) ${raw.substring(2, 7)}`;
        if (raw.length > 7) {
          masked += `-${raw.substring(7, 11)}`;
        }
      }
    }

    this.registerForm.get('phone')?.setValue(masked, { emitEvent: false });
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
    if (this.passwordStrength === 0) return 'Escolha uma senha para sua jornada';
    if (this.passwordStrength <= 2) return 'Fraca';
    if (this.passwordStrength <= 4) return 'Média';
    return 'Segura';
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
        this.successMessage = 'Sua página foi criada. Verifique seu e-mail e SMS para confirmar os códigos de validação.';
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.detail || 'Ocorreu um erro ao iniciar o seu registro.';
      }
    });
  }

  get f() {
    return this.registerForm.controls;
  }
}