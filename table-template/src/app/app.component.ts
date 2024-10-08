import { Component, OnInit, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ExcelUploadComponentComponent } from "./excel-upload-component/excel-upload-component.component";
import { MatToolbarModule } from '@angular/material/toolbar';
import { ToolbarComponent } from "./toolbar/toolbar.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserService } from './user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';


interface User{
  name:string;
}

interface Machineno{
  name: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ExcelUploadComponentComponent, MatToolbarModule, ToolbarComponent, CommonModule, FormsModule, MatButtonModule, MatIconModule],
  providers:[UserService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent implements OnInit {
  isDropdownVisible = false;
  clickListener!: () => void;
  email: string = '';
  password: string = '';
  name: string = '';
  users1: any[] = [];
  id: string = '';
  username: string = '';
  success: boolean = false;
  role: string = '';  // Role of the user
  users: User[] = [];
  machinename = '';
  machines: Machineno[] = [
    {name: 'A'},
    {name: 'B'},
    {name: 'C'},
    {name: 'D'}
];
  showcomponent : boolean =true;
  showcomponent1 : boolean=false;
  constructor(private http: HttpClient, private router: Router, private userService: UserService, private snackBar: MatSnackBar, private renderer: Renderer2, private elRef: ElementRef) {}
  ngOnInit(): void {
      this.getallUsers();
      
  }
  onLogin() {
    this.http.post('http://localhost:3000/api/login', { email: this.email, password: this.password })
      .subscribe(
        (response: any) => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('role', response.role);  // Store role in local storage
          localStorage.setItem('name', response.name);
          localStorage.setItem('id', response.id);
          console.log('Login successful, role:', response.role);
          console.log('checking response - ',response);
          this.role = response.role;
          this.name = response.name;
          this.id = response.id;
          this.success = true;
          this.showcomponent1=false;
          this.showcomponent=false;
          this.userService.setRole(this.role, this.name, this.id);
          console.log(this.role, this.name);
        },
        error => this.showLabelAlert(error.error.error)
      );
  }

  onSignup() {
    console.log(this.role);
    this.http.post('http://localhost:3000/api/signup', { email: this.email, name: this.name, username: this.username, password: this.password, role: this.role, machineno: this.machinename })
      .subscribe(
        (response: any) => {
          localStorage.setItem('token', response.token);
          console.log('Signup successful');
          this.showcomponent=true;
          this.showcomponent1=false;
        },
        error => this.showLabelAlert(error.error.error)
      );
  }

  getallUsers() {
    console.log('I came here');
    this.http.get<any[]>('http://localhost:3000/api/users')
      .subscribe(
        (response: any)=>{
          let k=0;
          for(let i=0;i<response.length;i++){
            if(response[i].role == "admin"){
              this.users=[
                {name: 'supervisor'},
                {name: 'operator'},
                {name: 'inspector'},
              ];
              k++;
            }
          }
          console.log(k);
          if(k<1){
            this.users = [
              {name: 'supervisor'},
              {name: 'operator'},
              {name: 'inspector'},
              {name: 'admin'}
            ];
          }
        }
      )
  }

  tologin(){
    this.showcomponent=true;
    this.showcomponent1=false;
  }

  logout(){
    this.email='';
    this.password='';
    this.showcomponent=true;
    this.showcomponent1=false;
    this.success=false;
    this.name='';
    this.role='';
    this.id='';
    this.isDropdownVisible=false;
  }

  showLabelAlert(err: string) {
    this.snackBar.open(err, 'Close', {
      duration: 5000,  // Auto close after 5 seconds
      verticalPosition: 'top',
      panelClass: ['custom-snackbar', 'professional-snackbar']  // Apply multiple styles
    });
  }

  tosignup(){
    this.name='';
    this.email='';
    this.password='';
    this.username='';
    this.role='';
    this.showcomponent=false;
    this.showcomponent1=true;
  }

  toggleDropdown() {
    this.isDropdownVisible = !this.isDropdownVisible;
    if (this.isDropdownVisible) {
      // Attach a listener to detect clicks outside the container
      this.clickListener = this.renderer.listen('document', 'click', (event: Event) => {
        if (!this.elRef.nativeElement.contains(event.target)) {
          this.isDropdownVisible = false;
          this.clickListener(); // Remove the listener after hiding the dropdown
        }
      });
    } else if (this.clickListener) {
      // Remove the listener when closing the dropdown manually
      this.clickListener();
    }
  }

  close(){
    this.isDropdownVisible=false;
  }
  // @HostListener('document:click', ['$event'])
  // onClickOutside(event: Event) {
  //   // Check if the click was outside the dropdown
  //   if (!this.elRef.nativeElement.contains(event.target)) {
  //     this.isDropdownVisible = false;
  //   }
  // }

}