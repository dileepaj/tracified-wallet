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
   @ViewChild('myImage', { static: false }) myImage: ElementRef;
   
   constructor(private loadCtrl: LoadingController, public apiService: ApiServiceProvider, public router: Router, private _sanitizer: DomSanitizer, public http: HttpClient) {
      this.hash = this.router.getCurrentNavigation().extras.queryParams;
      console.log('data passed ', this.hash);
   }

   ngOnInit() {
   }

   ngAfterViewInit() {
      // set the src attribute of the image
      this.loadSvg();
      // this.myImage.nativeElement.src = this.SVG;
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
            let svgData = (unescape(encodeURIComponent(res.Response)));
            this.myImage.nativeElement.srcdoc = svgData;

            if (this.startloading) {
               this.dissmissLoading();
            }
         },
         error => {
            if (this.startloading) {
               this.dissmissLoading();
            }
            console.log(error);
         }
      );
   }
}
