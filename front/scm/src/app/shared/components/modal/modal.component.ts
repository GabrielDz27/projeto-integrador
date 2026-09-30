import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent {
  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();

  // Conteúdo padrão
  @Input() title = '';
  @Input() description: string | null = null;

  // Footer padrão
  @Input() primaryLabel = 'Salvar';
  @Input() secondaryLabel = 'Cancelar';

  @Input() primaryDisabled = false;
  @Input() showFooter = true;

  @Output() primary = new EventEmitter<void>();
  @Output() secondary = new EventEmitter<void>();

  close(): void {
    this.openChange.emit(false);
  }

  onSecondary(): void {
    this.secondary.emit();
    this.close();
  }

  onPrimary(): void {
    this.primary.emit();
  }
}
