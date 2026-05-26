import { Routes } from '@angular/router';
import { RegisterComponent } from './auth/pages/register/register.component';


export const routes: Routes = [
  { path: '', redirectTo: 'cadastro', pathMatch: 'full' },
  { path: 'cadastro', component: RegisterComponent },
];