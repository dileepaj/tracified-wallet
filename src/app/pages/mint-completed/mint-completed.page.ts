import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
   selector: 'app-mint-completed',
   templateUrl: './mint-completed.page.html',
   styleUrls: ['./mint-completed.page.scss'],
})
export class MintCompletedPage implements OnInit {
   constructor(private router: Router) {}

   ngOnInit() {}

   viewNFTs() {
      this.router.navigate(['/get-nft'], { replaceUrl: true });
   }
}
