import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ExcelUploadComponentComponent } from "./excel-upload-component/excel-upload-component.component";
import { MatToolbarModule } from '@angular/material/toolbar';
import { ToolbarComponent } from "./toolbar/toolbar.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserService } from './user.service';

interface User{
  name:string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ExcelUploadComponentComponent, MatToolbarModule, ToolbarComponent, CommonModule, FormsModule],
  providers:[UserService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  email: string = '';
  password: string = '';
  name: string = '';
  username: string = '';
  success: boolean = false;
  role: string = '';  // Role of the user
  users: User[] = [
    {name: 'supervisor'},
    {name: 'operator'},
    {name: 'inspector'},
    {name: 'admin'}
];
  showcomponent : boolean =true;
  showcomponent1 : boolean=false;
  constructor(private http: HttpClient, private router: Router, private userService: UserService) {}

  onLogin() {
    this.http.post('http://localhost:3000/api/login', { email: this.email, password: this.password })
      .subscribe(
        (response: any) => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('role', response.role);  // Store role in local storage
          localStorage.setItem('name', response.name);
          console.log('Login successful, role:', response.role);
          this.role = response.role;
          this.name = response.name;
          this.success = true;
          this.showcomponent1=false;
          this.showcomponent=false;
          this.userService.setRole(this.role, this.name);
          console.log(this.role, this.name);
        },
        error => console.error('Login failed', error)
      );
  }

  onSignup() {
    console.log(this.role);
    this.http.post('http://localhost:3000/api/signup', { email: this.email, name: this.name, username: this.username, password: this.password, role: this.role })
      .subscribe(
        (response: any) => {
          localStorage.setItem('token', response.token);
          console.log('Signup successful');
          this.showcomponent=true;
          this.showcomponent1=false;
        },
        error => console.error('Signup failed', error)
      );
  }

  tologin(){
    this.showcomponent=true;
    this.showcomponent1=false;
  }

  logout(){
    this.showcomponent=true;
    this.showcomponent1=false;
    this.success=false;
  }

  tosignup(){
    this.showcomponent=false;
    this.showcomponent1=true;
  }
}