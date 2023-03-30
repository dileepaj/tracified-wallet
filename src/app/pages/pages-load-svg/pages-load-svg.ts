import { Component } from '@angular/core';

import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
   selector: 'page-pages-load-svg',
   templateUrl: 'pages-load-svg.html',
   styleUrls: ['./pages-load-svg.scss'],
})
export class PagesLoadSvgPage {
   result: any;
   SVG: any;

   constructor(public router: Router, private _sanitizer: DomSanitizer) {
      this.result = this.router.getCurrentNavigation().extras.queryParams;
      console.log('data passed ', this.result.Response);

      let encodedData = btoa(unescape(encodeURIComponent(this.result.Response)));
      // let hash = CryptoJS.SHA256(encodedData).toString(CryptoJS.enc.Hex);
      let str1 = new String('data:image/svg+xml;base64,');
      let imgBa64 = str1 + encodedData;
      this.SVG = this._sanitizer.bypassSecurityTrustResourceUrl(imgBa64);
   }
}
