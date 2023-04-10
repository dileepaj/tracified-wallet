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
import { AccountDetailsPage } from './pages/account-details/account-details.page';
import { FundTransferPage } from './pages/fund-transfer/fund-transfer.page';
import { TransferConfirmPage } from './pages/transfer-confirm/transfer-confirm.page';
import { OtpNtfComponent } from './pages/otp-ntf/otp-ntf.component';
import { ResetPasswordPage } from './pages/reset-password/reset-password';
import { ContentPage } from './pages/content/content';
import { HelpPage } from './pages/help-support/help';
import { SettingsPage } from './pages/settings/settings';
import { SettingFormPage } from './pages/setting-form/setting-form';
import { TransferPage } from './pages/transfer/transfer';
import { ItemDetailPage } from './pages/item-detail/item-detail';
import { AccountInfoPage } from './pages/account-info/account-info';

const routes: Routes = [
   { path: '', component: TabsPage },
   { path: 'get-nft', component: GetNftPage },
   { path: 'login', component: LoginPage },
   { path: 'otp-page', component: OtpPage },
   { path: 'mint-nft', component: MintNftPage },
   { path: 'get-key', component: GetKeysPage },
   { path: 'bc-account', component: BcAccountPage, canActivate: [AuthGuardService] },
   { path: 'add-account', component: AddAccountPage, canActivate: [AuthGuardService] },
   { path: 'svg-preview', component: PagesLoadSvgPage },
   { path: 'otp-nft', component: OtpNtfComponent },
   { path: 'psw-reset', component: ResetPasswordPage },
   { path: 'content', component: ContentPage },
   { path: 'help', component: HelpPage },
   { path: 'setting', component: SettingsPage },
   { path: 'setting-form', component: SettingFormPage },
   { path: 'account-details', component: AccountDetailsPage, canActivate: [AuthGuardService] },
   { path: 'fund-transfer', component: FundTransferPage },
   { path: 'transfer-confirm', component: TransferConfirmPage, canActivate: [AuthGuardService] },
   { path: 'item-detail', component: ItemDetailPage },
   { path: 'account-info', component: AccountInfoPage },

   {
      path: 'assets',
      component: TabsPage,
      children: [
         {
            path: '',
            pathMatch: 'full',
            redirectTo: 'transfer',
         },
         {
            path: 'transfer',
            loadChildren: () => import('./pages/transfer/transfer.module').then(m => m.TransferPageModule),
         },
         {
            path: 'item-sent',
            loadChildren: () => import('./pages/item-sent/item-sent.module').then(m => m.ItemSentPageModule),
         },
         {
            path: 'item-receive',
            loadChildren: () => import('./pages/item-received/item-received.module').then(m => m.ItemReceivedPageModule),
         },
      ],
   },

   // { path: 'bc-account', component: AddAccountPage },
];

@NgModule({
   imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
   exports: [RouterModule],
})
export class AppRoutingModule {}
