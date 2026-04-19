export type TvShowStatus = 'plan-to-watch' | 'watching' | 'completed' | 'dropped';

export type TvShowGenre =
  | 'drama'
  | 'comedy'
  | 'thriller'
  | 'sci-fi'
  | 'crime'
  | 'reality'
  | 'documentary'
  | 'anime';

export type TvShowDto = {
  id: string;
  title: string;
  genre: TvShowGenre;
  thumbnailUrl: string;
  status: TvShowStatus;
  rating: number | undefined;
};

export type CreateTvShowDto = {
  title: string;
  genre: TvShowGenre;
  thumbnailUrl: string;
  status: TvShowStatus;
};

export const TV_SHOW_STATUS_LABELS: Record<TvShowStatus, string> = {
  'plan-to-watch': 'Plan to Watch',
  watching: 'Watching',
  completed: 'Completed',
  dropped: 'Dropped',
};
