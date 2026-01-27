import { Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  template: `
    <div
      class="skeleton"
      [style.width]="width()"
      [style.height]="height()"
      [style.aspect-ratio]="aspectRatio()"
    ></div>
  `,
  styles: `
    .skeleton {
      background: linear-gradient(
        90deg,
        var(--color-surface-variant) 25%,
        var(--color-surface) 50%,
        var(--color-surface-variant) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
    }

    @keyframes shimmer {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .skeleton {
        animation: none;
        background: var(--color-surface-variant);
      }
    }
  `,
})
export class SkeletonLoaderComponent {
  width = input('100%');
  height = input('auto');
  aspectRatio = input<string | undefined>(undefined);
}
