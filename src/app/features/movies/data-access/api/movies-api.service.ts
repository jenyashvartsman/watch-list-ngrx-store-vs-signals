import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { CreateMovieDto, MovieDto } from '../dto/movie.dto';
import { SEED_MOVIES } from '../../../../initial-data/movies.initial-data';

const STORAGE_KEY = 'movies-watch-list';

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
