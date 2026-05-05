import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contact } from '../../models/contact.model';
import { InitialsPipe } from '../../pipes/initials.pipe';
import { AvatarColorPipe } from '../../pipes/avatar-color.pipe';

/**
 * Reusable avatar component.
 * Renders a contact photo (<img>) when available,
 * or a coloured initials fallback when the image is missing or errors.
 *
 * Replaces the vanilla buildAvatarHtml() function.
 */
@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule, InitialsPipe, AvatarColorPipe],
  template: `
    <ng-container *ngIf="contact">
      <!-- Photo avatar with initials fallback on error -->
      <ng-container *ngIf="contact.avatar; else initialsOnly">
        <img
          [src]="contact.avatar"
          [alt]="contact.firstName + ' ' + contact.lastName"
          class="rounded-2 object-fit-cover"
          [width]="dim"
          [height]="dim"
          [style.display]="imgError ? 'none' : 'block'"
          (error)="imgError = true"
        />
        <div
          *ngIf="imgError"
          class="avatar-initials rounded-2"
          [style.width.px]="dim"
          [style.height.px]="dim"
          [style.background]="contact.id | avatarColor"
          aria-hidden="true"
        >
          {{ contact.firstName | initials:contact.lastName }}
        </div>
      </ng-container>

      <!-- Initials-only avatar -->
      <ng-template #initialsOnly>
        <div
          class="avatar-initials rounded-2"
          [style.width.px]="dim"
          [style.height.px]="dim"
          [style.background]="contact.id | avatarColor"
          [attr.aria-label]="contact.firstName | initials:contact.lastName"
        >
          {{ contact.firstName | initials:contact.lastName }}
        </div>
      </ng-template>
    </ng-container>
  `,
  styles: []
})
export class AvatarComponent implements OnChanges {
  @Input() contact!: Contact;
  @Input() size: 'small' | 'large' = 'large';

  dim = 80;
  imgError = false;

  ngOnChanges(): void {
    this.dim = this.size === 'small' ? 36 : 80;
    // Reset error flag when contact changes
    this.imgError = false;
  }
}
