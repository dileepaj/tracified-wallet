import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
// import { TranslateService } from '@ngx-translate/core';
import { NavController } from '@ionic/angular';
import { AuthServiceProvider } from 'src/app/providers/auth-service/auth-service';
import { TransferPageService } from 'src/app/providers/transfer-page.service';

@Component({
   selector: 'page-tabs',
   templateUrl: 'tabs.html',
   styleUrls: ['./tabs.scss'],
})
export class TabsPage implements OnInit {
   tab1Title = ' ';
   tab2Title = ' ';
   tab3Title = ' ';
   didLoadOnce: boolean = false;

   constructor(
      public navCtrl: NavController, // public translateService: TranslateService
      private authService: AuthServiceProvider,
      private router: Router,
      private transferPageService: TransferPageService
   ) {
      this.tab1Title = 'Items';
      this.tab2Title = 'Sent';
      this.tab3Title = 'Received';
   }
   ngOnInit() {
      this.authService.getAppLindParam().then(res => {
         const option: NavigationExtras = {
            queryParams: {
               shopId: res.shopId,
               gemName: res.gemName,
            },
            replaceUrl: true,
         };
         this.navCtrl.navigateRoot('otp-bc-account', option);
      });
   }

   ionViewDidEnter() {
      this.didLoadOnce = true;
   }

   ionViewWillEnter() {
      if (this.didLoadOnce) {
         this.transferPageService.updateTransferPage(true);
      }
   }
}
