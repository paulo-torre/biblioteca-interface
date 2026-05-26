import { Routes } from '@angular/router';
import { RegisterComponent } from './auth/pages/register/register.component';
import { LoginComponent } from './auth/pages/login/login.component';


export const routes: Routes = [
  { path: '', redirectTo: 'cadastro', pathMatch: 'full' },
  { path: 'cadastro', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
];