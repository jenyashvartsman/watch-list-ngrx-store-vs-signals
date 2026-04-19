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
  selector: 'ui-drawer',
  templateUrl: './drawer.component.html',
  styleUrl: './drawer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrawerComponent {
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
