import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Employee, EmployeeData, EmployeeInput, EmployeeSaveResponse } from './employee';

describe('Employee', () => {
  let service: Employee;
  let httpTestingController: HttpTestingController;
  const apiUrl = 'http://localhost:5000/api/employees';
  const employee: EmployeeData = {
    id: 1,
    name: 'Alex Morgan',
    email: 'alex@example.com',
    department: 'Operations',
  };
  const employeeInput: EmployeeInput = {
    name: employee.name,
    email: employee.email,
    department: employee.department,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(Employee);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('gets all employees from the API', () => {
    let result: EmployeeData[] | undefined;
    service.getEmployees().subscribe((employees) => (result = employees));

    const request = httpTestingController.expectOne(apiUrl);
    expect(request.request.method).toBe('GET');
    request.flush([employee]);

    expect(result).toEqual([employee]);
  });

  it('gets one employee by ID', () => {
    let result: EmployeeData | undefined;
    service.getEmployeeById(employee.id).subscribe((value) => (result = value));

    const request = httpTestingController.expectOne(`${apiUrl}/${employee.id}`);
    expect(request.request.method).toBe('GET');
    request.flush(employee);

    expect(result).toEqual(employee);
  });

  it('adds an employee and uses the API response envelope', () => {
    const response: EmployeeSaveResponse = {
      message: 'Employee created successfully.',
      employee,
    };
    let result: EmployeeSaveResponse | undefined;
    service.addEmployee(employeeInput).subscribe((value) => (result = value));

    const request = httpTestingController.expectOne(apiUrl);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(employeeInput);
    request.flush(response);

    expect(result).toEqual(response);
  });

  it('updates an employee and uses the API response envelope', () => {
    const response: EmployeeSaveResponse = {
      message: 'Employee updated successfully.',
      employee,
    };
    let result: EmployeeSaveResponse | undefined;
    service.updateEmployee(employee.id, employeeInput).subscribe((value) => (result = value));

    const request = httpTestingController.expectOne(`${apiUrl}/${employee.id}`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(employeeInput);
    request.flush(response);

    expect(result).toEqual(response);
  });

  it('deletes an employee', () => {
    let result: unknown;
    service.deleteEmployee(employee.id).subscribe((value) => (result = value));

    const request = httpTestingController.expectOne(`${apiUrl}/${employee.id}`);
    expect(request.request.method).toBe('DELETE');
    request.flush({ message: 'Employee deleted successfully.' });

    expect(result).toEqual({ message: 'Employee deleted successfully.' });
  });
});
