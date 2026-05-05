import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contact, EmailAddress } from '../../models/contact.model';
import { ContactApiService } from '../../services/contact-api.service';
import { AvatarComponent } from '../avatar/avatar.component';

const SOCIAL_ICON_MAP: Record<string, string> = {
  facebook:  'fab fa-facebook-f',
  twitter:   'fab fa-twitter',
  linkedin:  'fab fa-linkedin-in',
  pinterest: 'fab fa-pinterest',
  instagram: 'fab fa-instagram',
  google:    'fab fa-google',
  github:    'fab fa-github',
};

/**
 * Renders the right-hand contact detail panel.
 * Fetches email addresses via ContactApiService on each contact change.
 * Angular equivalent of the vanilla ContactDetailsComponent class.
 */
@Component({
  selector: 'app-contact-details',
  standalone: true,
  imports: [CommonModule, AvatarComponent],
  templateUrl: './contact-details.component.html',
  styleUrls: ['./contact-details.component.scss']
})
export class ContactDetailsComponent implements OnChanges {
  @Input() contact: Contact | null = null;
  @Output() onBack = new EventEmitter<void>();

  emails: EmailAddress[] = [];
  loadingEmails = false;

  get primaryEmail(): EmailAddress | undefined {
    return this.emails.find(e => e.isPrimary);
  }
  get otherEmails(): EmailAddress[] {
    return this.emails.filter(e => !e.isPrimary);
  }
  get primaryPhone(): string | undefined {
    return this.contact?.phone?.[0];
  }
  get otherPhones(): string[] {
    return this.contact?.phone?.slice(1) ?? [];
  }
  get socialEntries(): { network: string; url: string; iconClass: string }[] {
    if (!this.contact?.social) return [];
    return Object.entries(this.contact.social).map(([network, url]) => ({
      network,
      url,
      iconClass: SOCIAL_ICON_MAP[network] || 'fas fa-globe'
    }));
  }

  constructor(private api: ContactApiService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['contact'] && this.contact) {
      this.loadEmails(this.contact.id);
    } else if (!this.contact) {
      this.emails = [];
    }
  }

  private loadEmails(id: string): void {
    this.loadingEmails = true;
    this.emails = [];
    this.api.getEmailAddresses(id).subscribe({
      next: emails => {
        this.emails = emails;
        this.loadingEmails = false;
      },
      error: () => { this.loadingEmails = false; }
    });
  }
}
