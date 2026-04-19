import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { MovieDto } from '../../data-access/dto/movie.dto';

@Component({
  selector: 'app-movies-rate-dialog',
  templateUrl: './movies-rate-dialog.component.html',
  styleUrl: './movies-rate-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoviesRateDialogComponent {
  readonly movie = input<MovieDto | null>(null);
  readonly isSaving = input(false);

  readonly closed = output<void>();
  readonly rated = output<number>();

  readonly stars = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  private readonly panelRef = viewChild<ElementRef<HTMLElement>>('panel');
  private readonly hoveredRating = signal(0);
  readonly selectedRating = signal(0);

  readonly displayRating = computed(() => this.hoveredRating() || this.selectedRating());

  constructor() {
    effect(() => {
      const movie = this.movie();
      if (movie) {
        this.selectedRating.set(movie.rating ?? 0);
        this.panelRef()?.nativeElement.focus();
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
