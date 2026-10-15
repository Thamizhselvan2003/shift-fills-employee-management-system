import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Employee, EmployeeData, EmployeeInput } from '../../services/employee';

@Component({
  selector: 'app-employee-form',
  imports: [ReactiveFormsModule],
  templateUrl: './employee-form.html',
  styleUrl: './employee-form.css',
})
export class EmployeeForm implements OnChanges {
  @Input() employee: EmployeeData | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/), Validators.minLength(2)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    department: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/)],
    }),
  });

  saving = false;
  successMessage = '';
  errorMessage = '';

  constructor(private employeeService: Employee) {}

  ngOnChanges(): void {
    this.form.reset();
    if (this.employee) {
      this.form.setValue({
        name: this.employee.name,
        email: this.employee.email,
        department: this.employee.department,
      });
    }
    this.successMessage = '';
    this.errorMessage = '';
  }

  submitForm(): void {
    this.form.patchValue({
      name: this.form.controls.name.value.trim(),
      email: this.form.controls.email.value.trim(),
      department: this.form.controls.department.value.trim(),
    });

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const employeeData: EmployeeInput = this.form.getRawValue();
    this.saving = true;
    this.successMessage = '';
    this.errorMessage = '';

    const request = this.employee
      ? this.employeeService.updateEmployee(this.employee.id, employeeData)
      : this.employeeService.addEmployee(employeeData);

    request.subscribe({
      next: () => {
        this.successMessage = this.employee
          ? 'Employee updated successfully.'
          : 'Employee added successfully.';
        this.saving = false;
        this.saved.emit();
      },
      error: (error: unknown) => {
        this.errorMessage = this.getErrorMessage(
          error,
          'Unable to save the employee. Please check the details and try again.',
        );
        this.saving = false;
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

  cancelForm(): void {
    this.cancelled.emit();
  }
}
