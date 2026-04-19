import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { CreateTvShowDto, TvShowDto, TvShowGenre, TvShowStatus } from '../dto/tv-show.dto';
import { SEED_SHOWS } from '../../../../initial-data/tv-shows.initial-data';

const STORAGE_KEY = 'tv-shows';

@Injectable({ providedIn: 'root' })
export class TvShowsApiService {
  private load(): TvShowDto[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_SHOWS));
      return SEED_SHOWS;
    }
    return JSON.parse(raw) as TvShowDto[];
  }

  private save(shows: TvShowDto[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shows));
  }

  getAll(): Observable<TvShowDto[]> {
    return of(this.load());
  }

  create(payload: CreateTvShowDto): Observable<TvShowDto> {
    const shows = this.load();
    const show: TvShowDto = { ...payload, id: crypto.randomUUID(), rating: undefined };
    this.save([...shows, show]);
    return of(show);
  }

  delete(id: string): Observable<void> {
    const shows = this.load();
    const exists = shows.some((s) => s.id === id);
    if (!exists) return throwError(() => new Error('Not found'));
    this.save(shows.filter((s) => s.id !== id));
    return of(undefined);
  }

  rate(id: string, rating: number): Observable<TvShowDto> {
    const shows = this.load();
    const show = shows.find((s) => s.id === id);
    if (!show) return throwError(() => new Error('Not found'));
    const updated = { ...show, rating };
    this.save(shows.map((s) => (s.id === id ? updated : s)));
    return of(updated);
  }

  updateStatus(id: string, status: TvShowStatus): Observable<TvShowDto> {
    const shows = this.load();
    const show = shows.find((s) => s.id === id);
    if (!show) return throwError(() => new Error('Not found'));
    const updated = { ...show, status };
    this.save(shows.map((s) => (s.id === id ? updated : s)));
    return of(updated);
  }
}
