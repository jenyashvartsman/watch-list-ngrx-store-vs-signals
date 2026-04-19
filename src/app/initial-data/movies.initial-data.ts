import { MovieDto } from '../features/movies/data-access/dto/movie.dto';

export const SEED_MOVIES: MovieDto[] = [
  {
    id: crypto.randomUUID(),
    title: 'The Shawshank Redemption',
    genre: 'drama',
    thumbnailUrl:
      'https://m.media-amazon.com/images/M/MV5BMDAyY2FhYjctNDc5OS00MDNlLThiMGUtY2UxYWVkNGY2ZjljXkEyXkFqcGc@._V1_.jpg',
    rating: undefined,
  },
  {
    id: crypto.randomUUID(),
    title: 'The Dark Knight',
    genre: 'action',
    thumbnailUrl:
      'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_FMjpg_UX1000_.jpg',
    rating: undefined,
  },
  {
    id: crypto.randomUUID(),
    title: 'Inception',
    genre: 'sci-fi',
    thumbnailUrl:
      'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg',
    rating: undefined,
  },
  {
    id: crypto.randomUUID(),
    title: 'Pulp Fiction',
    genre: 'thriller',
    thumbnailUrl:
      'https://m.media-amazon.com/images/M/MV5BNTY1MzgzOTYxNV5BMl5BanBnXkFtZTgwMDI4OTEwMjE@._V1_.jpg',
    rating: undefined,
  },
  {
    id: crypto.randomUUID(),
    title: 'The Matrix',
    genre: 'sci-fi',
    thumbnailUrl:
      'https://m.media-amazon.com/images/M/MV5BN2NmN2VhMTQtMDNiOS00NDlhLTliMjgtODE2ZTY0ODQyNDRhXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
    rating: undefined,
  },
  {
    id: crypto.randomUUID(),
    title: 'Forrest Gump',
    genre: 'drama',
    thumbnailUrl:
      'https://m.media-amazon.com/images/M/MV5BZTk0ZmUxZTktMDBlNC00YmZhLWJlNzgtMmY4M2NlNWIyYWZhXkEyXkFqcGc@._V1_.jpg',
    rating: undefined,
  },
  {
    id: crypto.randomUUID(),
    title: 'Fight Club',
    genre: 'thriller',
    thumbnailUrl:
      'https://m.media-amazon.com/images/M/MV5BOTgyOGQ1NDItNGU3Ny00MjU3LTg2YWEtNmEyYjBiMjI1Y2M5XkEyXkFqcGc@._V1_.jpg',
    rating: undefined,
  },
  {
    id: crypto.randomUUID(),
    title: 'Goodfellas',
    genre: 'thriller',
    thumbnailUrl:
      'https://m.media-amazon.com/images/M/MV5BYjllYzEzZDUtMmUxMi00MjEwLWFiYTQtNTg5OWY1MTlhYjI0XkEyXkFqcGdeQW1pYnJ5YW50._V1_.jpg',
    rating: undefined,
  },
  {
    id: crypto.randomUUID(),
    title: 'The Silence of the Lambs',
    genre: 'horror',
    thumbnailUrl:
      'https://m.media-amazon.com/images/M/MV5BNDdhOGJhYzctYzYwZC00YmI2LWI0MjctYjg4ODdlMDExYjBlXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
    rating: undefined,
  },
  {
    id: crypto.randomUUID(),
    title: "Schindler's List",
    genre: 'drama',
    thumbnailUrl:
      'https://m.media-amazon.com/images/M/MV5BNjM1ZDQxYWUtMzQyZS00MTE1LWJmZGYtNGUyNTdlYjM3ZmVmXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
    rating: undefined,
  },
];
