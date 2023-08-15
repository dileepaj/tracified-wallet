import { Component, ElementRef, ViewChild } from '@angular/core';

import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { LoadingController } from '@ionic/angular';
import { ApiServiceProvider } from 'src/app/providers/api-service/api-service';

@Component({
   selector: 'page-pages-load-svg',
   templateUrl: 'pages-load-svg.html',
   styleUrls: ['./pages-load-svg.scss'],
})
export class PagesLoadSvgPage {
   hash: any;
   SVG: any;
   loading: any;
   title: string;
   @ViewChild('myImage', { static: false }) myImage: ElementRef;

   constructor(private loadCtrl: LoadingController, public apiService: ApiServiceProvider, public router: Router, private _sanitizer: DomSanitizer, public http: HttpClient) {
      this.hash = this.router.getCurrentNavigation().extras.state.hash;
      this.title = this.router.getCurrentNavigation().extras.state.title;
   }

   ngOnInit() {}

   ngAfterViewInit() {
      this.loadSvg();
   }

   async startloading() {
      this.loading = await this.loadCtrl.create({
         message: 'loading...',
      });
      await this.loading.present();
   }

   async dissmissLoading() {
      await this.loading.dismiss();
   }

   loadSvg() {
      this.startloading();
      this.apiService.getSVGByHash(this.hash).subscribe(
         (res: any) => {
            // let svgData = unescape(encodeURIComponent(res.Response));
            // let svg = this._sanitizer.bypassSecurityTrustResourceUrl(svgData);
            this.myImage.nativeElement.srcdoc = res.Response;

            if (this.startloading) {
               this.dissmissLoading();
            }
         },
         error => {
            if (this.startloading) {
               this.dissmissLoading();
            }
         }
      );
   }
}
