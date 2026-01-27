import { Component, input, computed, effect, ElementRef, inject } from '@angular/core';
import { decode } from 'blurhash';

@Component({
  selector: 'app-blurhash-placeholder',
  template: `<canvas #canvas></canvas>`,
  styles: `
    :host {
      display: block;
      position: absolute;
      inset: 0;
    }

    canvas {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  `,
})
export class BlurhashPlaceholderComponent {
  hash = input.required<string>();
  width = input(32);
  height = input(32);

  private el = inject(ElementRef);

  constructor() {
    effect(() => {
      const canvas = this.el.nativeElement.querySelector('canvas') as HTMLCanvasElement;
      if (!canvas) return;

      const hash = this.hash();
      const w = this.width();
      const h = this.height();

      try {
        const pixels = decode(hash, w, h);
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const imageData = ctx.createImageData(w, h);
          imageData.data.set(pixels);
          ctx.putImageData(imageData, 0, 0);
        }
      } catch {
      }
    });
  }
}
