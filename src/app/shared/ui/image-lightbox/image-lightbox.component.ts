import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';

export type LightboxImage = { src: string; alt: string };

@Component({
  selector: 'ui-image-lightbox',
  templateUrl: './image-lightbox.component.html',
  styleUrl: './image-lightbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageLightboxComponent {
  readonly image = input<LightboxImage | null>(null);
  readonly closed = output<void>();

  private readonly closeRef = viewChild<ElementRef<HTMLElement>>('closeBtn');

  constructor() {
    effect(() => {
      if (this.image()) {
        this.closeRef()?.nativeElement.focus();
      }
    });
  }

  onClose(): void {
    this.closed.emit();
  }
}
