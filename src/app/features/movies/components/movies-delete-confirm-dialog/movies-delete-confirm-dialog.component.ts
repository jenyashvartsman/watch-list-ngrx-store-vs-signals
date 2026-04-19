import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DialogComponent } from '../../../../shared/ui/dialog/dialog.component';
import { MovieDto } from '../../data-access/dto/movie.dto';

@Component({
  selector: 'app-movies-delete-confirm-dialog',
  imports: [DialogComponent],
  templateUrl: './movies-delete-confirm-dialog.component.html',
  styleUrl: './movies-delete-confirm-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoviesDeleteConfirmDialogComponent {
  readonly movie = input<MovieDto | null>(null);
  readonly isSaving = input(false);

  readonly closed = output<void>();
  readonly confirmed = output<void>();
}
