import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DrawerComponent } from '../../../../shared/ui/drawer/drawer.component';
import { SelectOption } from '../../../../shared/ui/select/select.component';
import { CreateMovieDto, MovieGenre } from '../../data-access/dto/movie.dto';

const GENRES: SelectOption[] = [
  { value: 'action', label: 'Action' },
  { value: 'comedy', label: 'Comedy' },
  { value: 'drama', label: 'Drama' },
  { value: 'horror', label: 'Horror' },
  { value: 'romance', label: 'Romance' },
  { value: 'sci-fi', label: 'Sci-Fi' },
  { value: 'thriller', label: 'Thriller' },
  { value: 'documentary', label: 'Documentary' },
];

@Component({
  selector: 'app-movie-add-drawer',
  imports: [ReactiveFormsModule, DrawerComponent],
  templateUrl: './movie-add-drawer.component.html',
  styleUrl: './movie-add-drawer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieAddDrawerComponent {
  readonly isOpen = input(false);
  readonly isSaving = input(false);

  readonly closed = output<void>();
  readonly submitted = output<CreateMovieDto>();

  readonly genres = GENRES;

  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(1)]],
    genre: ['' as MovieGenre, Validators.required],
    thumbnailUrl: ['', Validators.required],
  });

  constructor() {
    effect(() => {
      if (!this.isOpen()) {
        this.form.reset();
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitted.emit(this.form.getRawValue());
  }

  onClose(): void {
    this.closed.emit();
  }
}
