import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'ui-dialog',
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogComponent {
  readonly isOpen = input(false);
  readonly title = input.required<string>();

  readonly closed = output<void>();

  readonly titleId = crypto.randomUUID();
  private readonly panelRef = viewChild<ElementRef<HTMLElement>>('panel');

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.panelRef()?.nativeElement.focus();
      }
    });
  }

  onClose(): void {
    this.closed.emit();
  }
}
