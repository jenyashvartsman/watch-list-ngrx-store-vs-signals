import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { CreateTvShowDto, TvShowDto, TvShowGenre, TvShowStatus } from '../dto/tv-show.dto';

const STORAGE_KEY = 'tv-shows';

const SEED_SHOWS: TvShowDto[] = [
  {
    id: 'tv-1',
    title: 'Breaking Bad',
    genre: 'crime',
    thumbnailUrl: 'https://picsum.photos/seed/breaking-bad/400/225',
    status: 'completed',
    rating: 10,
  },
  {
    id: 'tv-2',
    title: 'Stranger Things',
    genre: 'sci-fi',
    thumbnailUrl: 'https://picsum.photos/seed/stranger-things/400/225',
    status: 'watching',
    rating: 8,
  },
  {
    id: 'tv-3',
    title: 'The Wire',
    genre: 'crime',
    thumbnailUrl: 'https://picsum.photos/seed/the-wire/400/225',
    status: 'plan-to-watch',
    rating: undefined,
  },
  {
    id: 'tv-4',
    title: 'Fleabag',
    genre: 'comedy',
    thumbnailUrl: 'https://picsum.photos/seed/fleabag/400/225',
    status: 'completed',
    rating: 10,
  },
  {
    id: 'tv-5',
    title: 'Dark',
    genre: 'sci-fi',
    thumbnailUrl: 'https://picsum.photos/seed/dark-series/400/225',
    status: 'completed',
    rating: 9,
  },
  {
    id: 'tv-6',
    title: 'Chernobyl',
    genre: 'drama',
    thumbnailUrl: 'https://picsum.photos/seed/chernobyl/400/225',
    status: 'completed',
    rating: 9,
  },
  {
    id: 'tv-7',
    title: 'Sherlock',
    genre: 'thriller',
    thumbnailUrl: 'https://picsum.photos/seed/sherlock/400/225',
    status: 'completed',
    rating: 8,
  },
  {
    id: 'tv-8',
    title: 'Mindhunter',
    genre: 'crime',
    thumbnailUrl: 'https://picsum.photos/seed/mindhunter/400/225',
    status: 'plan-to-watch',
    rating: undefined,
  },
  {
    id: 'tv-9',
    title: 'Planet Earth',
    genre: 'documentary',
    thumbnailUrl: 'https://picsum.photos/seed/planet-earth/400/225',
    status: 'watching',
    rating: 9,
  },
  {
    id: 'tv-10',
    title: 'Attack on Titan',
    genre: 'anime',
    thumbnailUrl: 'https://picsum.photos/seed/attack-on-titan/400/225',
    status: 'watching',
    rating: 9,
  },
];

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
