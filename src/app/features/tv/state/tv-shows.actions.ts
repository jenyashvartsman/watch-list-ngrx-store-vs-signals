import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { CreateTvShowDto, TvShowDto, TvShowStatus } from '../data-access/dto/tv-show.dto';

export const TvShowsActions = createActionGroup({
  source: 'TV Shows',
  events: {
    'Load Shows': emptyProps(),
    'Load Shows Success': props<{ shows: TvShowDto[] }>(),
    'Load Shows Failure': props<{ error: string }>(),
    'Add Show': props<{ payload: CreateTvShowDto }>(),
    'Add Show Success': props<{ show: TvShowDto }>(),
    'Add Show Failure': props<{ error: string }>(),
    'Delete Show': props<{ id: string }>(),
    'Delete Show Success': props<{ id: string }>(),
    'Delete Show Failure': props<{ error: string }>(),
    'Rate Show': props<{ id: string; rating: number }>(),
    'Rate Show Success': props<{ show: TvShowDto }>(),
    'Rate Show Failure': props<{ error: string }>(),
    'Update Status': props<{ id: string; status: TvShowStatus }>(),
    'Update Status Success': props<{ show: TvShowDto }>(),
    'Update Status Failure': props<{ error: string }>(),
    'Update Filters': props<{ filters: { title?: string; status?: TvShowStatus | '' } }>(),
  },
});
