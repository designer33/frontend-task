import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactListComponent } from './contact-list.component';
import { Contact } from '../../models/contact.model';
import { By } from '@angular/platform-browser';

const SAMPLE_CONTACTS: Contact[] = [
  { id: '1', firstName: 'Johanna', lastName: 'Stevens', avatar: null,
    jobTitle: 'PM', bio: '', phone: ['111-111'], address: '', dial: '',
    meeting: '', social: {}, status: 'online', createdAt: '' },
  { id: '2', firstName: 'Nicholas', lastName: 'Gordon', avatar: null,
    jobTitle: 'Dev', bio: '', phone: ['222-222'], address: '', dial: '',
    meeting: '', social: {}, status: 'online', createdAt: '' },
  { id: '3', firstName: 'Bradley', lastName: 'Malone', avatar: null,
    jobTitle: 'Sales', bio: '', phone: ['333-333'], address: '', dial: '',
    meeting: '', social: {}, status: 'away', createdAt: '' },
];

// ── getInitials() logic (mirrored from InitialsPipe) ──────────────────────────
function getInitials(firstName: string, lastName: string): string {
  return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase();
}

describe('getInitials()', () => {
  it('returns uppercase initials from first and last name', () => {
    expect(getInitials('Johanna', 'Stevens')).toBe('JS');
  });
  it('handles single-word name gracefully', () => {
    expect(getInitials('Alice', '')).toBe('A');
  });
  it('handles empty strings', () => {
    expect(getInitials('', '')).toBe('');
  });
  it('extracts first character of each name', () => {
    expect(getInitials('Brian', 'Watson')).toBe('BW');
  });
});

// ── ContactListComponent.filter() ────────────────────────────────────────────
describe('ContactListComponent', () => {
  let component: ContactListComponent;
  let fixture: ComponentFixture<ContactListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactListComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactListComponent);
    component = fixture.componentInstance;
    component.contacts = [...SAMPLE_CONTACTS];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows all contacts when query is empty', () => {
    component.searchQuery = '';
    component.onSearch();
    expect(component.filteredContacts.length).toBe(3);
  });

  it('filters by first name (case-insensitive)', () => {
    component.searchQuery = 'johanna';
    component.onSearch();
    expect(component.filteredContacts.length).toBe(1);
    expect(component.filteredContacts[0].firstName).toBe('Johanna');
  });

  it('filters by last name (case-insensitive)', () => {
    component.searchQuery = 'MALONE';
    component.onSearch();
    expect(component.filteredContacts.length).toBe(1);
    expect(component.filteredContacts[0].lastName).toBe('Malone');
  });

  it('filters by partial name match', () => {
    component.searchQuery = 'gor';
    component.onSearch();
    expect(component.filteredContacts.length).toBe(1);
  });

  it('returns empty array for no match', () => {
    component.searchQuery = 'zzznomatch';
    component.onSearch();
    expect(component.filteredContacts.length).toBe(0);
  });

  it('resets to page 0 after filtering', () => {
    component.currentPage = 2;
    component.searchQuery = 'johanna';
    component.onSearch();
    expect(component.currentPage).toBe(0);
  });

  it('filters by phone number', () => {
    component.searchQuery = '333-333';
    component.onSearch();
    expect(component.filteredContacts.length).toBe(1);
    expect(component.filteredContacts[0].id).toBe('3');
  });

  it('trims whitespace from query', () => {
    component.searchQuery = '  Nicholas  ';
    component.onSearch();
    expect(component.filteredContacts.length).toBe(1);
  });

  it('clears search on Escape key', () => {
    component.searchQuery = 'johanna';
    component.onSearch();
    component.onSearchKeydown(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(component.filteredContacts.length).toBe(3);
  });

  it('emits contactSelected when a row is clicked', () => {
    component.contacts = [...SAMPLE_CONTACTS];
    fixture.detectChanges();

    spyOn(component.contactSelected, 'emit');
    component.selectContact('1');
    expect(component.contactSelected.emit).toHaveBeenCalledWith('1');
  });

  it('prevPage() decrements currentPage', () => {
    component.currentPage = 1;
    component.prevPage();
    expect(component.currentPage).toBe(0);
  });

  it('prevPage() does not go below 0', () => {
    component.currentPage = 0;
    component.prevPage();
    expect(component.currentPage).toBe(0);
  });

  it('nextPage() does not exceed totalPages - 1', () => {
    component.filteredContacts = SAMPLE_CONTACTS;
    component.currentPage = component.totalPages - 1;
    component.nextPage();
    expect(component.currentPage).toBe(component.totalPages - 1);
  });

  it('contactCountLabel is plural for multiple contacts', () => {
    component.filteredContacts = SAMPLE_CONTACTS;
    expect(component.contactCountLabel).toBe('3 contacts');
  });

  it('contactCountLabel is singular for one contact', () => {
    component.filteredContacts = [SAMPLE_CONTACTS[0]];
    expect(component.contactCountLabel).toBe('1 contact');
  });
});
