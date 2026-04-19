import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DrawerComponent } from '../../../../shared/ui/drawer/drawer.component';
import { SelectOption } from '../../../../shared/ui/select/select.component';
import { CreateTvShowDto, TvShowGenre, TvShowStatus } from '../../data-access/dto/tv-show.dto';

const GENRES: SelectOption[] = [
  { value: 'drama', label: 'Drama' },
  { value: 'comedy', label: 'Comedy' },
  { value: 'thriller', label: 'Thriller' },
  { value: 'sci-fi', label: 'Sci-Fi' },
  { value: 'crime', label: 'Crime' },
  { value: 'reality', label: 'Reality' },
  { value: 'documentary', label: 'Documentary' },
  { value: 'anime', label: 'Anime' },
];

const STATUSES: SelectOption[] = [
  { value: 'plan-to-watch', label: 'Plan to Watch' },
  { value: 'watching', label: 'Watching' },
  { value: 'completed', label: 'Completed' },
  { value: 'dropped', label: 'Dropped' },
];

@Component({
  selector: 'app-tv-shows-add-drawer',
  imports: [ReactiveFormsModule, DrawerComponent],
  templateUrl: './tv-shows-add-drawer.component.html',
  styleUrl: './tv-shows-add-drawer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TvShowsAddDrawerComponent {
  readonly isOpen = input(false);
  readonly isSaving = input(false);

  readonly closed = output<void>();
  readonly submitted = output<CreateTvShowDto>();

  readonly genres = GENRES;
  readonly statuses = STATUSES;

  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    genre: ['' as TvShowGenre, Validators.required],
    status: ['plan-to-watch' as TvShowStatus, Validators.required],
    thumbnailUrl: ['', Validators.required],
  });

  constructor() {
    effect(() => {
      if (!this.isOpen()) {
        this.form.reset({ status: 'plan-to-watch' });
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
