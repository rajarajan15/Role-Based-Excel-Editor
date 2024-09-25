import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginComponent } from "../login/login.component";

interface User{
  name: string;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, LoginComponent],
  providers:[],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})

export class SignupComponent {
  email: string = '';
  password: string = '';
  role: string = '';
  users: User[] = [
    {name: 'supervisor'},
    {name: 'operator'},
    {name: 'inspector'}
];

  constructor(private http: HttpClient, private router: Router) {}
  onSignup() {
    console.log(this.role);
    this.http.post('http://localhost:3000/api/signup', { email: this.email, password: this.password, role: this.role })
      .subscribe(
        (response: any) => {
          localStorage.setItem('token', response.token);
          console.log('Signup successful');
          this.router.navigate(['/login']);
        },
        error => console.error('Signup failed', error)
      );
  }
}