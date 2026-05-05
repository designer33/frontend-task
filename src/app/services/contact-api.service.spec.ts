import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ContactApiService } from './contact-api.service';

describe('ContactApiService', () => {
  let service: ContactApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ContactApiService]
    });
    service = TestBed.inject(ContactApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getContacts() should return contacts from API', (done) => {
    const mockData = [
      { id: '1', firstName: 'John', lastName: 'Doe', avatar: null,
        jobTitle: 'Dev', bio: '', phone: [], address: '', dial: '',
        meeting: '', social: {}, status: 'online', createdAt: '' }
    ];
    service.getContacts().subscribe(contacts => {
      expect(contacts.length).toBe(1);
      expect(contacts[0].firstName).toBe('John');
      done();
    });
    const req = httpMock.expectOne(req => req.url.includes('/contacts'));
    req.flush(mockData);
  });

  it('getContacts() should fall back to mock data on HTTP error', (done) => {
    service.getContacts().subscribe(contacts => {
      expect(contacts.length).toBeGreaterThan(0);
      expect(service.usingMockData$.value).toBeTrue();
      done();
    });
    const req = httpMock.expectOne(req => req.url.includes('/contacts'));
    req.flush('error', { status: 500, statusText: 'Server Error' });
  });

  it('getEmailAddresses() should fall back to mock data on HTTP error', (done) => {
    service.getEmailAddresses('1').subscribe(emails => {
      expect(emails.length).toBeGreaterThan(0);
      done();
    });
    const req = httpMock.expectOne(req => req.url.includes('/email_addresses'));
    req.flush('error', { status: 404, statusText: 'Not Found' });
  });
});
