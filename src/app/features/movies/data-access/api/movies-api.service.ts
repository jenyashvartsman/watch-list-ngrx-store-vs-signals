import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { CreateMovieDto, MovieDto } from '../dto/movie.dto';

const STORAGE_KEY = 'movies-watch-list';

const SEED_MOVIES: MovieDto[] = [
  {
    id: crypto.randomUUID(),
    title: 'The Shawshank Redemption',
    genre: 'drama',
    thumbnailUrl: 'https://picsum.photos/seed/shawshank/300/450',
    rating: undefined,
  },
  {
    id: crypto.randomUUID(),
    title: 'The Dark Knight',
    genre: 'action',
    thumbnailUrl: 'https://picsum.photos/seed/darkknight/300/450',
    rating: undefined,
  },
  {
    id: crypto.randomUUID(),
    title: 'Inception',
    genre: 'sci-fi',
    thumbnailUrl: 'https://picsum.photos/seed/inception/300/450',
    rating: undefined,
  },
  {
    id: crypto.randomUUID(),
    title: 'Pulp Fiction',
    genre: 'thriller',
    thumbnailUrl: 'https://picsum.photos/seed/pulpfiction/300/450',
    rating: undefined,
  },
  {
    id: crypto.randomUUID(),
    title: 'The Matrix',
    genre: 'sci-fi',
    thumbnailUrl: 'https://picsum.photos/seed/matrix/300/450',
    rating: undefined,
  },
  {
    id: crypto.randomUUID(),
    title: 'Forrest Gump',
    genre: 'drama',
    thumbnailUrl: 'https://picsum.photos/seed/forrestgump/300/450',
    rating: undefined,
  },
  {
    id: crypto.randomUUID(),
    title: 'Fight Club',
    genre: 'thriller',
    thumbnailUrl: 'https://picsum.photos/seed/fightclub/300/450',
    rating: undefined,
  },
  {
    id: crypto.randomUUID(),
    title: 'Goodfellas',
    genre: 'thriller',
    thumbnailUrl: 'https://picsum.photos/seed/goodfellas/300/450',
    rating: undefined,
  },
  {
    id: crypto.randomUUID(),
    title: 'The Silence of the Lambs',
    genre: 'horror',
    thumbnailUrl: 'https://picsum.photos/seed/silencelambs/300/450',
    rating: undefined,
  },
  {
    id: crypto.randomUUID(),
    title: "Schindler's List",
    genre: 'drama',
    thumbnailUrl: 'https://picsum.photos/seed/schindler/300/450',
    rating: undefined,
  },
];

@Injectable({ providedIn: 'root' })
export class MoviesApiService {
  getAll(): Observable<MovieDto[]> {
    return of(this.readStorage());
  }

  create(payload: CreateMovieDto): Observable<MovieDto> {
    const movies = this.readStorage();
    const newMovie: MovieDto = { ...payload, id: crypto.randomUUID(), rating: undefined };
    this.writeStorage([...movies, newMovie]);
    return of(newMovie);
  }

  delete(id: string): Observable<void> {
    const movies = this.readStorage();
    const exists = movies.some((m) => m.id === id);
    if (!exists) {
      return throwError(() => new Error(`Movie with id "${id}" not found.`));
    }
    this.writeStorage(movies.filter((m) => m.id !== id));
    return of(undefined);
  }

  rate(id: string, rating: number): Observable<MovieDto> {
    const movies = this.readStorage();
    const index = movies.findIndex((m) => m.id === id);
    if (index === -1) {
      return throwError(() => new Error(`Movie with id "${id}" not found.`));
    }
    const updated = { ...movies[index], rating };
    const next = [...movies];
    next[index] = updated;
    this.writeStorage(next);
    return of(updated);
  }

  private readStorage(): MovieDto[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      this.writeStorage(SEED_MOVIES);
      return SEED_MOVIES;
    }
    return JSON.parse(raw) as MovieDto[];
  }

  private writeStorage(movies: MovieDto[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
  }
}
