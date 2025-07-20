import 'react';

declare module 'react' {
  interface CSSProperties {
    '--dirty-bg'?: string;
    '--dirty-border'?: string;
  }
}
