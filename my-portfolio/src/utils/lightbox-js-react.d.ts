declare module 'lightbox.js-react' {
  import * as React from 'react';

  interface SlideshowLightboxProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
  }

  export function initLightboxJS(licenseKey: string, type?: string): void;
  export const SlideshowLightbox: React.FC<SlideshowLightboxProps>;
}
