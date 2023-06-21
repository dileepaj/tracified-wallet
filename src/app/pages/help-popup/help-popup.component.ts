import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { Browser } from '@capacitor/browser';

@Component({
   selector: 'app-help-popup',
   templateUrl: './help-popup.component.html',
   styleUrls: ['./help-popup.component.scss'],
})
export class HelpPopupComponent implements OnInit {
   @ViewChild('helpPopup') content: ElementRef;
   @ViewChild('helpBtn') helpBtn: ElementRef;
   @Input() data: any;

   isOpen = false;
   constructor() {}

   ngOnInit() {}

   presentPopover() {
      this.isOpen = true;
   }

   @HostListener('document:click', ['$event'])
   onClick(event) {
      if (!this.content?.nativeElement.contains(event.target) && !this.helpBtn?.nativeElement.contains(event.target)) {
         this.isOpen = false;
      }
   }

   async openWebpage(url: string) {
      await Browser.open({ url });
      this.isOpen = false;
   }
}
