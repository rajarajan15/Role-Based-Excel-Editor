import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TableService {
  private apiUrl = '/api/table'; // URL to backend API

  constructor(private http: HttpClient) {}

  // Call the backend to save the updated cell note
  updateCellNote(cell: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/updateCellNote`, cell);
  }
}