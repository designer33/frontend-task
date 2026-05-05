import {
  Component, Input, Output, EventEmitter, OnChanges, SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Contact } from '../../models/contact.model';
import { AvatarComponent } from '../avatar/avatar.component';

const PAGE_SIZE = 10;

/**
 * Renders the left-hand contacts panel: header, search, list, pagination.
 * Angular equivalent of the vanilla ContactListComponent class.
 */
@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule, FormsModule, AvatarComponent],
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.scss']
})
export class ContactListComponent implements OnChanges {
  /** Full contacts array provided by AppComponent */
  @Input() contacts: Contact[] = [];
  /** Currently selected contact id (for .active styling) */
  @Input() selectedId: string | null = null;
  /** Show the mock-data notice badge */
  @Input() usingMockData = false;
  /** Emitted when user clicks a contact row */
  @Output() contactSelected = new EventEmitter<string>();

  filteredContacts: Contact[] = [];
  currentPage = 0;
  searchQuery = '';

  get totalPages(): number {
    return Math.ceil(this.filteredContacts.length / PAGE_SIZE);
  }

  get pageItems(): Contact[] {
    const start = this.currentPage * PAGE_SIZE;
    return this.filteredContacts.slice(start, start + PAGE_SIZE);
  }

  get isPrevDisabled(): boolean { return this.currentPage === 0; }
  get isNextDisabled(): boolean { return this.currentPage >= this.totalPages - 1; }

  get contactCountLabel(): string {
    const n = this.filteredContacts.length;
    return `${n} contact${n !== 1 ? 's' : ''}`;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['contacts']) {
      this.filteredContacts = [...this.contacts];
      this.currentPage = 0;
      // Re-apply any existing search query
      if (this.searchQuery) this.applyFilter();
    }
  }

  onSearch(): void {
    this.applyFilter();
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.searchQuery = '';
      this.applyFilter();
    }
  }

  private applyFilter(): void {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) {
      this.filteredContacts = [...this.contacts];
    } else {
      this.filteredContacts = this.contacts.filter(c => {
        const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
        const phones   = (c.phone || []).join(' ').toLowerCase();
        return fullName.includes(q) || phones.includes(q);
      });
    }
    this.currentPage = 0;
  }

  prevPage(): void {
    if (!this.isPrevDisabled) this.currentPage--;
  }

  nextPage(): void {
    if (!this.isNextDisabled) this.currentPage++;
  }

  selectContact(id: string): void {
    this.contactSelected.emit(id);
  }

  statusClass(status: string): string {
    return status === 'online' ? 'bg-success' : 'bg-warning';
  }

  trackById(_: number, c: Contact): string { return c.id; }
}
