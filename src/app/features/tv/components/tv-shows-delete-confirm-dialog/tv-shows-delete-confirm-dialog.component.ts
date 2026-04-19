import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DialogComponent } from '../../../../shared/ui/dialog/dialog.component';
import { TvShowDto } from '../../data-access/dto/tv-show.dto';

@Component({
  selector: 'app-tv-shows-delete-confirm-dialog',
  imports: [DialogComponent],
  templateUrl: './tv-shows-delete-confirm-dialog.component.html',
  styleUrl: './tv-shows-delete-confirm-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TvShowsDeleteConfirmDialogComponent {
  readonly show = input<TvShowDto | null>(null);
  readonly isSaving = input(false);

  readonly closed = output<void>();
  readonly confirmed = output<void>();
}
