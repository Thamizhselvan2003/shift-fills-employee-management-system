import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmployeeData } from '../../services/employee';
import { EmployeeList } from './employee-list';

describe('EmployeeList', () => {
  let component: EmployeeList;
  let fixture: ComponentFixture<EmployeeList>;
  let httpTestingController: HttpTestingController;
  const apiUrl = 'http://localhost:5000/api/employees';
  const employees: EmployeeData[] = [
    {
      id: 1,
      name: 'Alex Morgan',
      email: 'alex@example.com',
      department: 'Operations',
    },
    {
      id: 2,
      name: 'Jamie Lee',
      email: 'jamie@example.com',
      department: 'Finance',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeList],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeList);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('loads employees from the API and renders the employee columns', () => {
    const request = httpTestingController.expectOne(apiUrl);
    expect(request.request.method).toBe('GET');
    request.flush(employees);
    fixture.detectChanges();

    const page = fixture.nativeElement as HTMLElement;
    expect(page.textContent).toContain('Alex Morgan');
    expect(page.textContent).toContain('alex@example.com');
    expect(page.textContent).toContain('Operations');
    expect(page.textContent).toContain('#1');
    expect(page.textContent).toContain('Actions');
    expect(page.querySelectorAll('tbody tr').length).toBe(2);
  });

  it('shows a loading indicator while the employee request is pending', () => {
    const page = fixture.nativeElement as HTMLElement;
    expect(page.textContent).toContain('Loading employees');

    httpTestingController.expectOne(apiUrl).flush([]);
  });

  it('filters names without case sensitivity', () => {
    httpTestingController.expectOne(apiUrl).flush(employees);
    component.searchTerm = 'aLeX';
    fixture.detectChanges();

    expect(component.filteredEmployees.map((employee) => employee.name)).toEqual([
      'Alex Morgan',
    ]);
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr').length).toBe(1);
  });

  it('shows an empty state when there are no employees', () => {
    httpTestingController.expectOne(apiUrl).flush([]);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('No employees yet');
  });

  it('shows an API error instead of crashing when loading fails', () => {
    httpTestingController.expectOne(apiUrl).flush(
      { error: 'Database unavailable.' },
      { status: 500, statusText: 'Server Error' },
    );
    fixture.detectChanges();

    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelector('[role="alert"]')?.textContent).toContain('Database unavailable.');
  });

  it('shows a success message and refreshes after adding an employee', () => {
    httpTestingController.expectOne(apiUrl).flush(employees);
    component.onEmployeeSaved();

    expect(component.statusMessage).toBe('Employee added successfully.');
    const refreshRequest = httpTestingController.expectOne(apiUrl);
    expect(refreshRequest.request.method).toBe('GET');
    refreshRequest.flush(employees);
  });

  it('shows a success message and refreshes after editing an employee', () => {
    httpTestingController.expectOne(apiUrl).flush(employees);
    component.selectedEmployee = employees[0];
    component.showForm = true;
    component.onEmployeeSaved();

    expect(component.statusMessage).toBe('Employee updated successfully.');
    expect(component.showForm).toBeFalse();
    const refreshRequest = httpTestingController.expectOne(apiUrl);
    expect(refreshRequest.request.method).toBe('GET');
    refreshRequest.flush(employees);
  });

  it('does not delete when the confirmation is cancelled', () => {
    httpTestingController.expectOne(apiUrl).flush(employees);
    spyOn(window, 'confirm').and.returnValue(false);

    component.deleteEmployee(employees[0]);

    expect(window.confirm).toHaveBeenCalled();
    httpTestingController.expectNone(`${apiUrl}/${employees[0].id}`);
  });

  it('deletes after confirmation and refreshes the employee list', () => {
    httpTestingController.expectOne(apiUrl).flush(employees);
    spyOn(window, 'confirm').and.returnValue(true);

    component.deleteEmployee(employees[0]);

    const deleteRequest = httpTestingController.expectOne(`${apiUrl}/${employees[0].id}`);
    expect(deleteRequest.request.method).toBe('DELETE');
    deleteRequest.flush({ message: 'Employee deleted successfully.' });

    const refreshRequest = httpTestingController.expectOne(apiUrl);
    expect(refreshRequest.request.method).toBe('GET');
    refreshRequest.flush([employees[1]]);

    expect(component.employees).toEqual([employees[1]]);
    expect(component.statusMessage).toBe('Employee deleted successfully.');
  });
});
