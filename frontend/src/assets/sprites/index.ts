import neutral  from './pommeNeutral.PNG';
import study    from './pommeStudy.PNG';
import sad      from './pommeSad.PNG';
import curious  from './pommeCurious.PNG';
import teasing  from './pommeTeasing.PNG';
import happy   from './pommeHappy.PNG';

export const sprites: Record<string, string> = {
  neutral,
  study,
  sad,
  curious,
  teasing,
  happy,
  '': neutral, // fallback
};