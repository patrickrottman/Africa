import { Component, input, computed } from '@angular/core';
import type { Variant } from '@africa/shared';

@Component({
  selector: 'app-responsive-image',
  template: `
    <picture>
      @if (variant().avifUrl) {
        <source [srcset]="variant().avifUrl" type="image/avif" />
      }
      @if (variant().webpUrl) {
        <source [srcset]="variant().webpUrl" type="image/webp" />
      }
      <img
        [src]="variant().jpgUrl"
        [alt]="alt()"
        [width]="variant().width"
        [height]="variant().height"
        [loading]="loading()"
        [class]="imgClass()"
      />
    </picture>
  `,
  styles: `
    :host {
      display: contents;
      pointer-events: none;
    }

    picture {
      display: contents;
    }

    img {
      max-width: 100%;
      height: auto;
      display: block;
      pointer-events: none;
    }
  `,
})
export class ResponsiveImageComponent {
  variant = input.required<Variant>();
  alt = input('');
  loading = input<'lazy' | 'eager'>('lazy');
  imgClass = input('');
}
