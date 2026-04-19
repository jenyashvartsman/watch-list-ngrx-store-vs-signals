import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { SelectComponent, SelectOption } from '../../../../shared/ui/select/select.component';
import { TextInputComponent } from '../../../../shared/ui/text-input/text-input.component';
import { TvShowStatus } from '../../data-access/dto/tv-show.dto';
import { TvShowsFilters } from '../../state/tv-shows.reducer';

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'plan-to-watch', label: 'Plan to Watch' },
  { value: 'watching', label: 'Watching' },
  { value: 'completed', label: 'Completed' },
  { value: 'dropped', label: 'Dropped' },
];

@Component({
  selector: 'app-tv-shows-filter',
  imports: [TextInputComponent, SelectComponent],
  templateUrl: './tv-shows-filter.component.html',
  styleUrl: './tv-shows-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TvShowsFilterComponent {
  readonly filters = input.required<TvShowsFilters>();
  readonly filtersChange = output<Partial<TvShowsFilters>>();

  readonly statusOptions = STATUS_OPTIONS;

  onTitleChange(title: string): void {
    this.filtersChange.emit({ title });
  }

  onStatusChange(status: string): void {
    this.filtersChange.emit({ status: status as TvShowStatus | '' });
  }
}
