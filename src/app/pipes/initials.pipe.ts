import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generates uppercase initials from first and last name.
 * Angular equivalent of the vanilla getInitials() utility function.
 *
 * Usage: {{ contact.firstName | initials:contact.lastName }}
 */
@Pipe({
  name: 'initials',
  standalone: true
})
export class InitialsPipe implements PipeTransform {
  transform(firstName: string, lastName: string = ''): string {
    return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase();
  }
}
