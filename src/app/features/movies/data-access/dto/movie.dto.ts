export type MovieGenre = 'comedy' | 'action' | 'drama' | 'thriller' | 'horror' | 'sci-fi' | 'romance' | 'documentary';

export type MovieDto = {
  id: string;
  title: string;
  genre: MovieGenre;
  thumbnailUrl: string;
  rating: number | undefined;
};

export type CreateMovieDto = {
  title: string;
  genre: MovieGenre;
  thumbnailUrl: string;
};
