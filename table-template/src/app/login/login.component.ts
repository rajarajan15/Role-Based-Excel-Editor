import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers:[],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  onLogin() {
    this.http.post('http://localhost:3000/api/login', { email: this.email, password: this.password })
      .subscribe(
        (response: any) => {
          localStorage.setItem('token', response.token);
          console.log('Login successful');
          this.router.navigate(['/']);
        },
        error => console.error('Login failed', error)
      );
  }
}