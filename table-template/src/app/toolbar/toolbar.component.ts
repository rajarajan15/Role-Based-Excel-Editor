import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ExcelUploadComponentComponent } from "../excel-upload-component/excel-upload-component.component";
@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [MatToolbarModule, ExcelUploadComponentComponent],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css'
})
export class ToolbarComponent {

}