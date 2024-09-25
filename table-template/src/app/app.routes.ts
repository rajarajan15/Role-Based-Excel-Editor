import { Routes } from '@angular/router';
import { ExcelUploadComponentComponent } from './excel-upload-component/excel-upload-component.component';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    {
        path: 'admin/excel',
        component: ExcelUploadComponentComponent,
    // Only admin can access
    },
    {
        path: 'user/excel',
        component: ExcelUploadComponentComponent,
    // Both user and admin can access (optional)
    },
    { path: '**', redirectTo: 'login' }
];