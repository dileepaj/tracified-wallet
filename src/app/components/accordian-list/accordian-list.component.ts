import { Component, ElementRef, Input, Renderer2, ViewChild } from '@angular/core';

@Component({
  selector: 'accordian-list',
  templateUrl: 'accordian-list.component.html'
})
export class AccordianListComponent {
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

  @ViewChild('accordianContent') elementView: ElementRef;

  viewHeight: number;

  constructor(public renderer: Renderer2) { }

  ngAfterViewInit() {
    this.viewHeight = this.elementView.nativeElement.offsetHeight;

    if (!this.expanded) {
      this.renderer.setStyle(this.elementView.nativeElement, 'height', 0 + 'px');
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
    this.renderer.setStyle(this.elementView.nativeElement, 'height', newHeight);
  }

}
