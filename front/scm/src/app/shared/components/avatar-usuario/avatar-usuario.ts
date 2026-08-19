import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, computed, signal } from '@angular/core';

type AvatarSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-avatar-usuario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'avatar-usuario.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarComponent {
  @Input() src: string | null | undefined = null;
  @Input() name: string | null | undefined = null;

  @Input() size: AvatarSize = 'md';
  @Input() ring = true;
  @Input() alt: string | null | undefined = null;

  private readonly failed = signal(false);

  readonly showImg = computed(() => !!this.src && !this.failed());

  readonly initials = computed(() => {
    const n = (this.name ?? '').trim();
    if (!n) return '👤';
    const parts = n.split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] ?? 'U';
    const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
    return (a + b).toUpperCase();
  });

  readonly sizeClass = computed(() => {
    switch (this.size) {
      case 'sm': return 'h-9 w-9 text-xs';
      case 'lg': return 'h-20 w-20 text-xl';
      default: return 'h-12 w-12 text-base';
    }
  });

  readonly ringClass = computed(() => (this.ring ? 'ring-1 ring-black/5' : ''));

  onImgError(): void {
    this.failed.set(true);
  }
}
