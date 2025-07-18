import { Directive, HostListener, Input, ElementRef } from '@angular/core';

@Directive({
  selector: 'img[fallback]',
  standalone: true
})
export class FallbackImgDirective {
  @Input() fallback = '/images/picture.png';

  constructor(private el: ElementRef<HTMLImageElement>) {}

  @HostListener('error')
  onError() {
    const element = this.el.nativeElement;
    if (element.src !== this.fallback) {
      element.src = this.fallback;
    }
  }
}
