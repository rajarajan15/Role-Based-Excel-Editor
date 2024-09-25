import { Injectable } from '@angular/core';

@Injectable()
export class UserService {
  private userRole: string = '';
  private name: string = '';
  // Method to set user role
  setRole(role: string, name: string) {
    console.log('I came here');
    console.log(role);
    this.userRole = role;
    this.name = name;
  }

  // Method to get user role
  getRole(){
    console.log('I came here too');
    console.log(this.userRole);
    return this.userRole;
  }
  getName(){
    console.log('I came for name');
    console.log(this.name);
    return this.name;
  }
}