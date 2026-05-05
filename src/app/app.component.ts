import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactApiService } from './services/contact-api.service';
import { Contact } from './models/contact.model';
import { ContactListComponent } from './components/contact-list/contact-list.component';
import { ContactDetailsComponent } from './components/contact-details/contact-details.component';

/**
 * Root application component.
 * Orchestrates data loading, contact selection state, and mobile panel toggling.
 * Angular equivalent of the vanilla ContactApp bootstrapper class.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ContactListComponent, ContactDetailsComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  contacts: Contact[] = [];
  selectedContact: Contact | null = null;
  usingMockData = false;
  isLoading = true;
  loadError = false;
  /** True on mobile when the detail panel should slide in */
  detailOpen = false;

  constructor(private api: ContactApiService) {}

  ngOnInit(): void {
    this.api.usingMockData$.subscribe(v => (this.usingMockData = v));

    this.api.getContacts().subscribe({
      next: contacts => {
        this.contacts = contacts;
        this.isLoading = false;
        // Auto-select first contact for a good first impression
        if (contacts.length > 0) {
          this.onContactSelected(contacts[0].id);
        }
      },
      error: () => {
        this.loadError = true;
        this.isLoading = false;
      }
    });
  }

  onContactSelected(id: string): void {
    const contact = this.contacts.find(c => c.id === id);
    if (!contact) return;
    this.selectedContact = contact;
    this.detailOpen = true;  // slide detail panel in on mobile
  }

  onBack(): void {
    this.detailOpen = false;
  }
}
