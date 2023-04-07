import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ItemSentPage } from './item-sent';

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
      RouterModule.forChild([{ path: '', component: ItemSentPage }]),
   ],
   declarations: [ItemSentPage],
   exports: [ItemSentPage],
})
export class ItemSentPageModule {}
