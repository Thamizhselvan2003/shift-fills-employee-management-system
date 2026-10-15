import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface EmployeeData {
  id: number;
  name: string;
  email: string;
  department: string;
}

export type EmployeeInput = Omit<EmployeeData, 'id'>;

export interface EmployeeSaveResponse {
  message: string;
  employee: EmployeeData;
}

@Injectable({
  providedIn: 'root',
})
export class Employee {
  private apiUrl = 'http://localhost:5000/api/employees';

  constructor(private http: HttpClient) {}

  getEmployees(): Observable<EmployeeData[]> {
    return this.http.get<EmployeeData[]>(this.apiUrl);
  }

  getEmployeeById(id: number): Observable<EmployeeData> {
    return this.http.get<EmployeeData>(`${this.apiUrl}/${id}`);
  }

  addEmployee(employee: EmployeeInput): Observable<EmployeeSaveResponse> {
    return this.http.post<EmployeeSaveResponse>(this.apiUrl, employee);
  }

  updateEmployee(id: number, employee: EmployeeInput): Observable<EmployeeSaveResponse> {
    return this.http.put<EmployeeSaveResponse>(`${this.apiUrl}/${id}`, employee);
  }

  deleteEmployee(id: number): Observable<unknown> {
    return this.http.delete<unknown>(`${this.apiUrl}/${id}`);
  }
}
