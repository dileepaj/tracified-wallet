import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { TransferPage } from './transfer';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

export function createTranslateLoader(http: HttpClient) {
   return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

@NgModule({
   imports: [
      TranslateModule.forRoot({
         loader: {
            provide: TranslateLoader,
            useFactory: createTranslateLoader,
            deps: [HttpClient],
         },
      }),
      IonicModule,
      RouterModule.forChild([{ path: '', component: TransferPage }]),
      CommonModule,
   ],
   declarations: [TransferPage],
   exports: [TransferPage],
})
export class TransferPageModule {}
