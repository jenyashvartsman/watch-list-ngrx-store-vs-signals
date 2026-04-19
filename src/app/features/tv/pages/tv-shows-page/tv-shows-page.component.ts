import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { TvShowDto } from '../../data-access/dto/tv-show.dto';
import { TvShowsFacade } from '../../state/tv-shows.facade';
import { TvShowsFilters } from '../../state/tv-shows.reducer';
import { TvShowsAddDrawerComponent } from '../../components/tv-shows-add-drawer/tv-shows-add-drawer.component';
import { TvShowsDeleteConfirmDialogComponent } from '../../components/tv-shows-delete-confirm-dialog/tv-shows-delete-confirm-dialog.component';
import { TvShowsErrorComponent } from '../../components/tv-shows-error/tv-shows-error.component';
import { TvShowsFilterComponent } from '../../components/tv-shows-filter/tv-shows-filter.component';
import { TvShowsListComponent } from '../../components/tv-shows-list/tv-shows-list.component';
import { TvShowsRateDialogComponent } from '../../components/tv-shows-rate-dialog/tv-shows-rate-dialog.component';
import { CreateTvShowDto, TvShowStatus } from '../../data-access/dto/tv-show.dto';

@Component({
  selector: 'app-tv-shows-page',
  imports: [
    TvShowsFilterComponent,
    TvShowsListComponent,
    TvShowsErrorComponent,
    TvShowsAddDrawerComponent,
    TvShowsRateDialogComponent,
    TvShowsDeleteConfirmDialogComponent,
  ],
  templateUrl: './tv-shows-page.component.html',
  styleUrl: './tv-shows-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TvShowsPageComponent implements OnInit {
  readonly facade = inject(TvShowsFacade);

  readonly isDrawerOpen = signal(false);
  readonly ratingShow = signal<TvShowDto | null>(null);
  readonly deletingShow = signal<TvShowDto | null>(null);

  ngOnInit(): void {
    this.facade.initialize();
  }

  onFiltersChange(filters: Partial<TvShowsFilters>): void {
    this.facade.updateFilters(filters);
  }

  openDrawer(): void {
    this.isDrawerOpen.set(true);
  }

  closeDrawer(): void {
    this.isDrawerOpen.set(false);
  }

  onShowSubmit(payload: CreateTvShowDto): void {
    this.facade.addShow(payload);
    this.closeDrawer();
  }

  onStatusChange(event: { id: string; status: TvShowStatus }): void {
    this.facade.updateStatus(event.id, event.status);
  }

  openRateDialog(show: TvShowDto): void {
    this.ratingShow.set(show);
  }

  closeRateDialog(): void {
    this.ratingShow.set(null);
  }

  onShowRated(rating: number): void {
    const show = this.ratingShow();
    if (!show) return;
    this.facade.rateShow(show.id, rating);
    this.closeRateDialog();
  }

  openDeleteDialog(show: TvShowDto): void {
    this.deletingShow.set(show);
  }

  closeDeleteDialog(): void {
    this.deletingShow.set(null);
  }

  onShowDelete(): void {
    const show = this.deletingShow();
    if (!show) return;
    this.facade.deleteShow(show.id);
    this.closeDeleteDialog();
  }
}
