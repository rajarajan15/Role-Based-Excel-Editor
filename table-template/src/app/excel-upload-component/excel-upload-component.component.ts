import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Observable, tap } from 'rxjs';
import * as XLSX from 'xlsx';
import { RoleSelectionDialogComponent } from '../role-selection-dialog/role-selection-dialog.component';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { UserService } from '../user.service';

interface CellData {
  value: string;
  rowspan: number;
  colspan: number;
  isEditable: boolean;
  isBold: boolean | undefined;
  row: number;
  col: number;
  note?: string;
  isDropdownOpen?: boolean; // Add this property
}

interface Machineno{
  name: string;
}

interface SheetData {
  cells: CellData[];
  name: string;
  machineno: string;
  id?: string; // For database reference
}

interface Username{
  name: string;
  role: string;
  _id: string;
  machineno: string;
}

@Component({
  selector: 'app-excel-upload-component',
  standalone: true,
  imports: [FormsModule,
            CommonModule,
            MatSnackBarModule,
            ReactiveFormsModule,
            MatToolbarModule,
            ToolbarComponent,
            MatIconModule,
            MatSelectModule,
            MatFormFieldModule,
            MatCheckboxModule,
            RoleSelectionDialogComponent
          ],
  providers:[UserService],
  templateUrl: './excel-upload-component.component.html',
  styleUrls: ['./excel-upload-component.component.css']
})

export class ExcelUploadComponentComponent implements OnInit {
  excelData: CellData[][] = [];
  sheetData!: SheetData;
  loadSheetId: string = '';
  rolename: string = '';
  name: string = '';
  savedforms: any[] = [];
  savedformssize: number = 0;
  save: boolean = false;
  isAdmin: boolean = false;
  userid: string = '';
  usernames: Username[] = [];
  roles: string[] = ['supervisor', 'operator', 'inspector'];
  machineno: string = '';
  machinename: string = '';
  machines: Machineno[] = [
    {name: 'A'},
    {name: 'B'},
    {name: 'C'},
    {name: 'D'}
];

  constructor(private http: HttpClient, private snackBar: MatSnackBar, private userService: UserService, private dialog: MatDialog) {}

  ngOnInit() {
    this.initializeSheetData();
    // this.loadSavedfiles();
    
    // Fetch role, name, and user ID from local storage or service
    this.rolename = localStorage.getItem('role') || this.userService.getRole();
    this.name = localStorage.getItem('name') || this.userService.getName();
    this.userid = localStorage.getItem('id') || this.userService.getid();
    console.log(this.rolename);
  
    // Check if user is admin
    if (this.rolename == 'admin') {
      this.isAdmin = true;
    }
  
    // Load saved file size
    this.loadSavedfilessize();
    
    // Fetch all users
    this.getAllUsers().subscribe(() => {
      // Now this block will execute only after getAllUsers has fetched the data
      // If the user is an operator, set the machine number
      if (this.rolename == 'operator') {
        console.log('userid - ',this.userid);
        for (let i = 0; i < this.usernames.length; i++) {
          if (this.usernames[i]._id == this.userid) {
            this.machineno = this.usernames[i].machineno;
          }
        }
        this.loadSavedfiles();
      }
    });
  }

  initializeSheetData() {
    this.sheetData = {
      cells: [],
      name: '',
      machineno:'',
      id:''
    };
  }

  onFileChange(event: any) {
    const target: DataTransfer = (event.target);
    this.savedformssize = 0;
    if (target.files.length !== 1) {
      alert('Please upload only one file.');
      throw new Error('Cannot use multiple files');
    }

    const file = target.files[0];

    // Check if the uploaded file is an Excel file by its extension or MIME type
    const fileName = file.name;
    const fileExtension = fileName.split('.').pop() || ''; // Provide a default empty string
    const validExtensions = ['xlsx', 'xls'];

    if (!validExtensions.includes(fileExtension)) {
      alert('Invalid file type. Please upload an Excel file (.xlsx or .xls).');
      return;  // Stop the function if the file type is invalid
    }
  
    const reader = new FileReader();
    reader.onload = async (e: any) => {
      const arrayBuffer = e.target.result;
      // Step 1: Read the file with xlsx
      const wbXlsx = XLSX.read(arrayBuffer, { type: 'array' });
      const wsXlsx = wbXlsx.Sheets[wbXlsx.SheetNames[0]];
      const merges = wsXlsx['!merges'] || [];
      
      // Step 2: Read cell styles with ExcelJS
      const wbExcelJS = new ExcelJS.Workbook();
      await wbExcelJS.xlsx.load(arrayBuffer);
      const wsExcelJS = wbExcelJS.worksheets[0];
      
      // Process the sheet with your custom logic
      this.processSheet(wsXlsx, wsExcelJS, merges);
      this.prepareSheetData();
    };

    reader.readAsArrayBuffer(file);
    this.save = true;
  }
  

  processSheet(wsXlsx: XLSX.WorkSheet, wsExcelJS: ExcelJS.Worksheet, merges: XLSX.Range[]) {
    const range = XLSX.utils.decode_range(wsXlsx['!ref'] || 'A1');

    this.excelData = Array.from({ length: range.e.r + 1 }, () => Array(range.e.c + 1).fill(null));

    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cellXlsx = wsXlsx[cellAddress];
        const cellExcelJS = wsExcelJS.getCell(R + 1, C + 1);

        const cellValue = cellXlsx?.v?.toString() || '';
        let isEditable = false;
        let isBold = undefined;
        let note = '';

        if (cellExcelJS.note && typeof cellExcelJS.note === 'object') {
          const comment = cellExcelJS.note;
          note = comment.texts?.map(textObj => textObj.text).join('') || ''; // Save the note
          if (note.includes(this.rolename)) {
            isEditable = true; // Make editable if the note contains the role name
          }
        }

        if (cellExcelJS.font) {
          isBold = cellExcelJS.font.bold === true;
        }

        const cellData: CellData = {
          value: cellValue,
          rowspan: 1,
          colspan: 1,
          isEditable: isEditable,
          isBold: isBold,
          row: R,
          col: C,
          note: note // Include the note

        };

        const mergeData = this.findMergedCell(R, C, merges);
        if (mergeData) {
          cellData.rowspan = mergeData.rowspan;
          cellData.colspan = mergeData.colspan;
        }

        if (!this.isCellHidden(R, C, merges)) {
          this.excelData[R][C] = cellData;
        }
      }
    }
  }

  prepareSheetData() {
    // Prompt the user for a sheet name
    const sheetName = window.prompt('Enter sheet name:', 'Sheet1');
    
    // Fallback to a default name if the user cancels or enters nothing
    const finalSheetName = sheetName && sheetName.trim() !== '' ? sheetName : 'Sheet1';
    console.log('From prepare sheet - ',this.machinename);
    this.sheetData = {
      cells: this.excelData.flat().filter(cell => cell !== null).map(cell => ({
        ...cell,
        note: cell.note // Ensure note is included
      })) as CellData[],
      name: finalSheetName, // Use the name entered by the user,
      machineno: this.machinename
    };
  }

  resetSheetData() {
    this.excelData=[];
    this.initializeSheetData();
  }

  findMergedCell(row: number, col: number, merges: XLSX.Range[]): { rowspan: number, colspan: number } | null {
    for (const merge of merges) {
      if (row === merge.s.r && col === merge.s.c) {
        return {
          rowspan: merge.e.r - merge.s.r + 1,
          colspan: merge.e.c - merge.s.c + 1
        };
      }
    }
    return null;
  }

  isCellHidden(row: number, col: number, merges: XLSX.Range[]): boolean {
    return merges.some(merge =>
      (row > merge.s.r && row <= merge.e.r && col >= merge.s.c && col <= merge.e.c) ||
      (col > merge.s.c && col <= merge.e.c && row >= merge.s.r && row <= merge.e.r)
    );
  }

  saveToDatabase() {
    // Make all cells non-editable before saving
    this.sheetData.cells.forEach(cell => {
      cell.isEditable = false; // Set editable to false
    });
    this.sheetData.machineno = this.machinename;
    console.log('From save file - ',this.machinename);
    this.http.post('http://localhost:3000/api/save-sheet', this.sheetData).subscribe(
      (response: any) => {
        console.log('Sheet saved successfully', response);
        this.showSuccessMessage();
        this.sheetData.id = response.id; // Store the database ID for future updates
        // this.loadSavedfiles();
        this.save=false;
        this.loadSavedfilessize();
      },
      (error) => {
        console.log(this.sheetData);
        this.showLabelAlert2();
        console.error('Error saving sheet', error);
      }
    );
  }

  onMachineChange() {
    this.loadSavedfiles();  // Call the function when machine is selected
  }

  loadSavedfiles() {
    console.log('Changed machine name - ',this.machineno);
    this.savedforms = [];
    this.http.get<any[]>('http://localhost:3000/api/sheets').subscribe(
      forms => {
        let k=0;
        for(let i=0;i<forms.length;i++){
          console.log()
          if(forms[i].machineno == this.machineno){
            this.savedforms[k] = forms[i];
            k++;
          }
        }
        console.log('Check - ',this.savedforms);
      },
      error => console.error('Error loading saved forms', error)
    )
  }

  loadSavedfilessize() {
    console.log('Changed machine name - ',this.machineno);
    this.savedforms = [];
    this.http.get<any[]>('http://localhost:3000/api/sheets').subscribe(
      forms => {
        this.savedformssize = forms.length;
        console.log('Check - ',this.savedformssize);
      },
      error => console.error('Error loading saved forms', error)
    )
  }

  updateDatabase() {
    // Make all cells non-editable before updating
    this.sheetData.cells.forEach(cell => {
      cell.isEditable = false; // Set editable to false
    });

    this.http.patch(`http://localhost:3000/api/update-sheet/${this.loadSheetId}`, this.sheetData).subscribe(
      (response) => {
        this.showSuccessMessage1();
        this.loadFromDatabase(this.loadSheetId);
        console.log('Sheet updated successfully', response);
      },
      (error) => {
        this.showLabelAlert1();
        console.error('Error updating sheet', error);
      }
    );
  }

  getAllUsers(): Observable<Username[]> {
    return this.http.get<Username[]>('http://localhost:3000/api/users').pipe(
      tap((response: Username[]) => {
        console.log(response);
        this.usernames = response.map(user => ({
          name: user.name,
          role: user.role,
          _id: user._id,
          machineno: user.machineno
        }));
      })
    );
  }
  

  showLabelAlert() {
    this.snackBar.open('⚠️ Error Loading Sheet !', 'Close', {
      duration: 5000,  // Auto close after 5 seconds
      verticalPosition: 'top',
      panelClass: ['custom-snackbar', 'professional-snackbar']  // Apply multiple styles
    });
  }
  showLabelAlert1() {
    this.snackBar.open('⚠️ Error Updating Sheet !', 'Close', {
      duration: 5000,  // Auto close after 5 seconds
      verticalPosition: 'top',
      panelClass: ['custom-snackbar', 'professional-snackbar']  // Apply multiple styles
    });
  }
  showLabelAlert2() {
    this.snackBar.open('⚠️ Error Saving Sheet !', 'Close', {
      duration: 5000,  // Auto close after 5 seconds
      verticalPosition: 'top',
      panelClass: ['custom-snackbar', 'professional-snackbar']  // Apply multiple styles
    });
  }
  showLabelAlert3() {
    this.snackBar.open('⚠️ ONLY ADMINS CAN ASSIGN THE ROLES !', 'Close', {
      duration: 5000,  // Auto close after 5 seconds
      verticalPosition: 'top',
      panelClass: ['custom-snackbar', 'professional-snackbar']  // Apply multiple styles
    });
  }

  loadFromDatabase(id: string) {
    this.http.get<SheetData>(`http://localhost:3000/api/get-sheet/${id}`).subscribe(
      (response) => {
        this.showSuccessMessage2();
        console.log('Raw response:', response); // Check raw response
        
        // Assuming normalizeSheetData is supposed to format the response
        this.sheetData = this.normalizeSheetData(response);
        console.log('Normalized sheet data:', this.sheetData); // Log normalized data
  
        // Check the structure of the cells
        console.log('Loaded cells:', this.sheetData.cells);
  
        // Iterate through cells to determine if they should be editable
        this.sheetData.cells.forEach(cell => {
          const cellNote = cell.note || ''; // Get the note or default to an empty string
          console.log('Cell Note:', cellNote); // Log the note for each cell
          const roleNameExists = cellNote.includes(this.rolename); // Check if the note contains the role name
          cell.isEditable = roleNameExists; // Set editable based on the note
        });

        this.rebuildExcelData();
      },
      (error) => {
        this.showLabelAlert();
        console.error('Error loading sheet', error);
      }
    );
  }
  

  normalizeSheetData(data: any): SheetData {
    // Ensure each cell has all required properties
    const normalizedCells = data.cells.map((cell: any) => ({
      value: cell.value || '',
      rowspan: cell.rowspan || 1,
      colspan: cell.colspan || 1,
      isEditable: cell.isEditable !== undefined ? cell.isEditable : true,
      isBold: cell.isBold || false,
      row: cell.row || 0,
      col: cell.col || 0,
      note: cell.note || ''
    }));

    return {
      cells: normalizedCells,
      name: data.name || 'Sheet1',
      machineno: this.machineno,
      id: data.id
    };
  }

  rebuildExcelData() {
    if (!this.sheetData || !this.sheetData.cells || this.sheetData.cells.length === 0) {
      this.showLabelAlert();
      console.error('Invalid sheet data');
      this.excelData = [];
      return;
    }

    const maxRow = Math.max(...this.sheetData.cells.map(cell => cell.row));
    const maxCol = Math.max(...this.sheetData.cells.map(cell => cell.col));

    this.excelData = Array.from({ length: maxRow + 1 }, () => Array(maxCol + 1).fill(null));

    for (const cell of this.sheetData.cells) {
      if (cell.row >= 0 && cell.col >= 0) {
        this.excelData[cell.row][cell.col] = cell;
      }
    }

    console.log('Rebuilt excelData:', this.excelData);  // Log the rebuilt data
  }

  updateCellValue(rowIndex: number, cellIndex: number, newValue: string) {
    const cell = this.excelData[rowIndex]?.[cellIndex];
    if (cell) {
      cell.value = newValue;
      // Update the flat array as well
      const flatIndex = this.sheetData.cells.findIndex(c => c.row === rowIndex && c.col === cellIndex);
      if (flatIndex !== -1) {
        this.sheetData.cells[flatIndex].value = newValue;
      }
    }
  }

  editCell(cell: any) {
    if (!this.isAdmin) {
      this.showLabelAlert3();
      return;
    }
    // Prompt the admin to enter or modify a note
    const newNote = prompt('Enter a new note for this cell:', cell.note || '');

    if (newNote !== null) {
      // Update the note in the table data
      cell.note = newNote;
    }
  }

  toggleDropdown(cell: any) {
    if (!this.isAdmin) {
      this.showLabelAlert3();
      return;
    }

    const selectedRoles = cell.note ? cell.note.split(' ') : [];

    const dialogRef = this.dialog.open(RoleSelectionDialogComponent, {
      width: '250px',
      data: {
        roles: this.roles,
        selectedRoles: selectedRoles
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        cell.note = result.join(' '); // Store selected roles as a space-separated string
      }
    });
  }

  // Check if a role is already selected in the not
  isRoleSelected(note: string | undefined, role: string): boolean {
    // Ensure that 'note' is a string before splitting
    return typeof note === 'string' && note.split(' ').includes(role);
  }
  
  // Handle role selection change (checkbox)
  onRoleSelectionChange(cell: CellData, role: string, event: any) {
    const selectedRoles = cell.note ? cell.note.split(' ') : [];
  
    if (event.target.checked) {
      // Add role if selected
      selectedRoles.push(role);
    } else {
      // Remove role if deselected
      const index = selectedRoles.indexOf(role);
      if (index !== -1) {
        selectedRoles.splice(index, 1);
      }
    }
  
    // Update the note as a space-separated string
    cell.note = selectedRoles.join(' ');
  }  

//Drag and drop file
  onDragOver(event: DragEvent) {
    event.preventDefault(); // Prevent default to allow drop
    const dropZone = event.currentTarget as HTMLElement;
    dropZone.classList.add('dragover'); // Add drag over style
  }

  onDragLeave(event: DragEvent) {
    const dropZone = event.currentTarget as HTMLElement;
    dropZone.classList.remove('dragover'); // Remove drag over style
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const dropZone = event.currentTarget as HTMLElement;
    dropZone.classList.remove('dragover'); // Remove drag over style

    // Get the dropped files
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      // Handle file change event
      this.onFileChange({ target: { files: files } });
    }
  }

  triggerFileInput() {
    const fileInput = document.getElementById('fileInput') as HTMLElement;
    fileInput.click();
  }
//Success Messages
  showSuccessMessage() {
    this.snackBar.open('Sheet Saved successfully!','close', {
      duration: 3000,  // Duration in milliseconds
      verticalPosition: 'top',
      panelClass: ['success-snackbar']  // Optional: custom CSS class
    });
  }

  showSuccessMessage1() {
    this.snackBar.open('Sheet Updated Successfully!','close', {
      duration: 3000,  // Duration in milliseconds
      verticalPosition: 'top',
      panelClass: ['success-snackbar']  // Optional: custom CSS class
    });
  }

  showSuccessMessage2() {
    this.snackBar.open('Sheet Loaded Successfully!','close', {
      duration: 3000,  // Duration in milliseconds
      verticalPosition: 'top',
      panelClass: ['success-snackbar']  // Optional: custom CSS class
    });
  }

  downloadExcel() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Displayed Data');
    // Assuming that `excelData` contains the displayed table data
    this.excelData.forEach((row, rowIndex) => {
      // Ensure that the row and cells are defined
      if (!row || row.length === 0) {
        return; // Skip empty or invalid rows
      }

      const excelRow = worksheet.addRow(row.map(cell => cell?.value ?? '')); // Use nullish coalescing to avoid null/undefined

      row.forEach((cell, colIndex) => {
        if (!cell) {
          return; // Skip undefined or invalid cells
        }

        const excelCell = excelRow.getCell(colIndex + 1);

        // Apply bold formatting if specified
        if (cell.isBold) {
          excelCell.font = { bold: true };
        }

        // Merge cells if needed
        if (cell.rowspan > 1 || cell.colspan > 1) {
          worksheet.mergeCells(
            rowIndex + 1,
            colIndex + 1,
            rowIndex + cell.rowspan,
            colIndex + cell.colspan
          );
        }

        // Apply notes as comments (optional)
        if (cell.note) {
          excelCell.note = cell.note;
        }
      });
    });

    // Generate the Excel file and trigger the download
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, 'table_data.xlsx'); // Download the file
    });
  }
}