import { Component, ElementRef, Input, Renderer, ViewChild } from '@angular/core';

@Component({
  selector: 'accordion-list',
  templateUrl: 'accordion-list.html'
})
export class AccordionListComponent {
  @Input() headerColor: string = '#ffffff';
  @Input() textColor: string = '#000000';
  @Input() contentColor: string = '#ffffff';
  @Input() date: string;
  @Input() uname: string;
  @Input() oname: string;
  @Input() qty: string;
  @Input() status: string;
  @Input() hasMargin: boolean = true;
  @Input() expanded: boolean;

  @ViewChild('accordionContent') elementView: ElementRef;

  viewHeight: number;

  constructor(public renderer: Renderer) { }

  ngAfterViewInit() {
    this.viewHeight = this.elementView.nativeElement.offsetHeight;

    if (!this.expanded) {
      this.renderer.setElementStyle(this.elementView.nativeElement, 'height', 0 + 'px');
    }
  }

    /**
* @desc toggles the accordian when clicked
* @param 
* @author Jaje thananjaje3@gmail.com
* @return 
*/
  toggleAccordion() {
    this.expanded = !this.expanded;
    const newHeight = this.expanded ? '100%' : '0px';
    this.renderer.setElementStyle(this.elementView.nativeElement, 'height', newHeight);
  }

}