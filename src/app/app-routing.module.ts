import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { GetKeysPage } from './pages/get-keys/get-keys';
import { GetNftPage } from './pages/get-nft/get-nft';
import { MintNftPage } from './pages/mint-nft/mint-nft';
import { OtpPage } from './pages/otp/otp';
import { PagesLoadSvgPage } from './pages/pages-load-svg/pages-load-svg';
import { TabsPage } from './pages/tabs/tabs';

const routes: Routes = [
   { path: '', component: TabsPage },
   { path: 'get-nft', component: GetNftPage },
   { path: 'otp-page', component: OtpPage },
   { path: 'mint-nft', component: MintNftPage },
   { path: 'get-nft', component: GetNftPage },
   { path: 'get-key', component: GetKeysPage },
];

@NgModule({
   imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
   exports: [RouterModule],
})
export class AppRoutingModule {}
