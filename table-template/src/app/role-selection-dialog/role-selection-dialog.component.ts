import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-role-selection-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './role-selection-dialog.component.html',
  styleUrl: './role-selection-dialog.component.css'
})
export class RoleSelectionDialogComponent {
  roles: string[]; // Available roles
  selectedRoles: string[]; // Roles currently selected

  // Injecting dialog data and dialog reference for closing the dialog
  constructor(
    public dialogRef: MatDialogRef<RoleSelectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.roles = data.roles; // Receiving roles from the parent component
    this.selectedRoles = data.selectedRoles ? [...data.selectedRoles] : [];
  }

  // Method to handle changes in role selection
  onRoleChange(role: string, event: Event) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.selectedRoles.push(role);
    } else {
      const index = this.selectedRoles.indexOf(role);
      if (index > -1) {
        this.selectedRoles.splice(index, 1);
      }
    }
  }

  // Method to save selected roles and close the dialog
  save() {
    this.dialogRef.close(this.selectedRoles); // Closing the dialog and passing the selected roles
  }

  close() {
    this.dialogRef.close();
  }
}
