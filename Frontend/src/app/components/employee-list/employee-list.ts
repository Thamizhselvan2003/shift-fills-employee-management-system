import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Employee, EmployeeData } from '../../services/employee';
import { EmployeeForm } from '../employee-form/employee-form';

@Component({
  selector: 'app-employee-list',
  imports: [EmployeeForm],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.css',
})
export class EmployeeList implements OnInit {
  employees: EmployeeData[] = [];
  searchTerm = '';
  loading = false;
  showForm = false;
  selectedEmployee: EmployeeData | null = null;
  deletingId: number | null = null;
  errorMessage = '';
  statusMessage = '';

  constructor(private employeeService: Employee) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  get filteredEmployees(): EmployeeData[] {
    const search = this.searchTerm.trim().toLowerCase();
    return this.employees.filter((employee) =>
      employee.name.toLowerCase().includes(search),
    );
  }

  updateSearch(event: Event): void {
    const input = event.target;
    if (input instanceof HTMLInputElement) {
      this.searchTerm = input.value;
    }
  }

  loadEmployees(): void {
    this.loading = true;
    this.errorMessage = '';

    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
        this.loading = false;
      },
      error: (error: unknown) => {
        this.errorMessage = this.getErrorMessage(
          error,
          'Unable to load employees. Check that the backend is running and try again.',
        );
        this.loading = false;
      },
    });
  }

  openAddForm(): void {
    this.selectedEmployee = null;
    this.showForm = true;
    this.statusMessage = '';
  }

  editEmployee(employee: EmployeeData): void {
    this.selectedEmployee = employee;
    this.showForm = true;
    this.statusMessage = '';
  }

  closeForm(): void {
    this.showForm = false;
    this.selectedEmployee = null;
  }

  onEmployeeSaved(): void {
    this.statusMessage = this.selectedEmployee
      ? 'Employee updated successfully.'
      : 'Employee added successfully.';
    this.closeForm();
    this.loadEmployees();
  }

  deleteEmployee(employee: EmployeeData): void {
    const confirmed = window.confirm(`Delete ${employee.name}? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    this.deletingId = employee.id;
    this.statusMessage = '';
    this.errorMessage = '';

    this.employeeService.deleteEmployee(employee.id).subscribe({
      next: () => {
        this.statusMessage = 'Employee deleted successfully.';
        this.deletingId = null;
        this.loadEmployees();
      },
      error: (error: unknown) => {
        this.errorMessage = this.getErrorMessage(
          error,
          'Unable to delete this employee. Please try again.',
        );
        this.deletingId = null;
      },
    });
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (
      error instanceof HttpErrorResponse &&
      typeof error.error?.error === 'string'
    ) {
      return error.error.error;
    }

    return fallback;
  }
}
