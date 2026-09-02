// @types/react 18.2 kent fetchPriority nog niet, terwijl browsers het al jaren
// ondersteunen. De import bovenaan maakt van dit bestand een module, zodat de
// declaratie hieronder de bestaande types aanvult in plaats van vervangt.
import 'react';

declare module 'react' {
  interface ImgHTMLAttributes<T> extends HTMLAttributes<T> {
    fetchPriority?: 'high' | 'low' | 'auto';
  }
}
