import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { GetKeysPage } from './pages/get-keys/get-keys';
import { GetNftPage } from './pages/get-nft/get-nft';
import { MintNftPage } from './pages/mint-nft/mint-nft';
import { OtpPage } from './pages/otp/otp';
import { LoginPage } from './pages/login/login';
import { PagesLoadSvgPage } from './pages/pages-load-svg/pages-load-svg';
import { TabsPage } from './pages/tabs/tabs';
import { AuthGuardService } from './providers/auth/auth-guard.service';
import { BcAccountPage } from './pages/bc-account/bc-account';
import { AddAccountPage } from './pages/add-account/add-account';

const routes: Routes = [
   { path: '', component: TabsPage },
   { path: 'assets', component: TabsPage, canActivate: [AuthGuardService] },
   { path: 'get-nft', component: GetNftPage },
   { path: 'login', component: LoginPage },
   { path: 'otp-page', component: OtpPage },
   { path: 'mint-nft', component: MintNftPage },
   { path: 'get-key', component: GetKeysPage },
   { path: 'bc-account', component: BcAccountPage },
   { path: 'bc-account', component: AddAccountPage },
];

@NgModule({
   imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
   exports: [RouterModule],
})
export class AppRoutingModule {}
