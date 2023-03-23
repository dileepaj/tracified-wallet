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

const routes: Routes = [
   { path: '', component: TabsPage },
   { path: 'home', component: TabsPage },
   { path: 'get-nft', component: GetNftPage, canActivate: [AuthGuardService] },
   { path: 'login', component: LoginPage },
   { path: 'otp-page', component: OtpPage },
   { path: 'mint-nft', component: MintNftPage },
   { path: 'get-key', component: GetKeysPage },
];

@NgModule({
   imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
   exports: [RouterModule],
})
export class AppRoutingModule {}
