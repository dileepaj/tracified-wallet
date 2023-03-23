import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { GetNftPage } from './pages/get-nft/get-nft';
import { LoginPage } from './pages/login/login';
import { PagesLoadSvgPage } from './pages/pages-load-svg/pages-load-svg';
import { TabsPage } from './pages/tabs/tabs';
import { AuthGuardService } from './providers/auth/auth-guard.service';

const routes: Routes = [
  { path: '', component: TabsPage },
  { path: 'home', component: TabsPage },
  { path: 'get-nft', component: GetNftPage,canActivate: [AuthGuardService] },
  { path: 'login', component: LoginPage },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
