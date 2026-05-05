import { Pipe, PipeTransform } from '@angular/core';

const AVATAR_COLORS: string[] = [
  '#6B59CC', '#26609E', '#E85D75', '#F4A261', '#2A9D8F',
  '#E76F51', '#8338EC', '#3A86FF', '#06D6A0', '#FFB703'
];

/**
 * Returns a deterministic colour for a contact based on their id.
 * Mirrors the vanilla getAvatarColor() function.
 *
 * Usage: [style.background]="contact.id | avatarColor"
 */
@Pipe({
  name: 'avatarColor',
  standalone: true
})
export class AvatarColorPipe implements PipeTransform {
  transform(id: string): string {
    const index = parseInt(id, 10) % AVATAR_COLORS.length;
    return AVATAR_COLORS[isNaN(index) ? 0 : index] || AVATAR_COLORS[0];
  }
}
