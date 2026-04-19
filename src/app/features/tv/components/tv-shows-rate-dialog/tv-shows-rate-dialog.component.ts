import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { DialogComponent } from '../../../../shared/ui/dialog/dialog.component';
import { TvShowDto } from '../../data-access/dto/tv-show.dto';

@Component({
  selector: 'app-tv-shows-rate-dialog',
  imports: [DialogComponent],
  templateUrl: './tv-shows-rate-dialog.component.html',
  styleUrl: './tv-shows-rate-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TvShowsRateDialogComponent {
  readonly show = input<TvShowDto | null>(null);
  readonly isSaving = input(false);

  readonly closed = output<void>();
  readonly rated = output<number>();

  readonly stars = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  private readonly hoveredRating = signal(0);
  readonly selectedRating = signal(0);
  readonly displayRating = computed(() => this.hoveredRating() || this.selectedRating());

  constructor() {
    effect(() => {
      const show = this.show();
      if (show) {
        this.selectedRating.set(show.rating ?? 0);
      }
    });
  }

  onStarHover(n: number): void {
    this.hoveredRating.set(n);
  }

  onStarsLeave(): void {
    this.hoveredRating.set(0);
  }

  onStarClick(n: number): void {
    this.selectedRating.set(n);
  }

  onSubmit(): void {
    if (this.selectedRating() === 0) return;
    this.rated.emit(this.selectedRating());
  }

  onClose(): void {
    this.closed.emit();
  }
}
