import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmployeeData, EmployeeSaveResponse } from '../../services/employee';
import { EmployeeForm } from './employee-form';

describe('EmployeeForm', () => {
  let component: EmployeeForm;
  let fixture: ComponentFixture<EmployeeForm>;
  let httpTestingController: HttpTestingController;
  const apiUrl = 'http://localhost:5000/api/employees';
  const employee: EmployeeData = {
    id: 1,
    name: 'Alex Morgan',
    email: 'alex@example.com',
    department: 'Operations',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeForm],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeForm);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('marks required fields invalid and does not send an API request', () => {
    component.submitForm();

    expect(component.form.invalid).toBeTrue();
    expect(component.form.controls.name.touched).toBeTrue();
    expect(component.form.controls.email.touched).toBeTrue();
    expect(component.form.controls.department.touched).toBeTrue();
    httpTestingController.expectNone(apiUrl);
  });

  it('rejects a whitespace-only name and invalid email', () => {
    component.form.setValue({
      name: '   ',
      email: 'not-an-email',
      department: 'Operations',
    });

    component.submitForm();

    expect(component.form.controls.name.invalid).toBeTrue();
    expect(component.form.controls.email.invalid).toBeTrue();
    httpTestingController.expectNone(apiUrl);
  });

  it('trims input values and adds a valid employee', () => {
    component.form.setValue({
      name: ' Alex Morgan ',
      email: ' alex@example.com ',
      department: ' Operations ',
    });
    const saved = spyOn(component.saved, 'emit');

    component.submitForm();

    const request = httpTestingController.expectOne(apiUrl);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      name: 'Alex Morgan',
      email: 'alex@example.com',
      department: 'Operations',
    });
    const response: EmployeeSaveResponse = {
      message: 'Employee created successfully.',
      employee,
    };
    request.flush(response);

    expect(saved).toHaveBeenCalled();
    expect(component.saving).toBeFalse();
  });

  it('loads the selected employee and updates it', () => {
    fixture.componentRef.setInput('employee', employee);
    fixture.detectChanges();
    expect(component.form.getRawValue()).toEqual({
      name: employee.name,
      email: employee.email,
      department: employee.department,
    });

    component.form.controls.department.setValue('Customer Support');
    component.submitForm();

    const request = httpTestingController.expectOne(`${apiUrl}/${employee.id}`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body.department).toBe('Customer Support');
    request.flush({
      message: 'Employee updated successfully.',
      employee: { ...employee, department: 'Customer Support' },
    });
  });

  it('shows the backend error response when saving fails', () => {
    component.form.setValue({
      name: employee.name,
      email: employee.email,
      department: employee.department,
    });
    component.submitForm();

    const request = httpTestingController.expectOne(apiUrl);
    request.flush(
      { error: 'An employee with this email already exists.' },
      { status: 400, statusText: 'Bad Request' },
    );
    fixture.detectChanges();

    expect(component.errorMessage).toBe('An employee with this email already exists.');
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'An employee with this email already exists.',
    );
  });
});
