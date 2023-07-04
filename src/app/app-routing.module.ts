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
import { CreateAccountPage } from './pages/create-account/create-account.page';
import { RequestDeletePage } from './pages/request-delete/request-delete.page';
import { CreateImportBcAccountPage } from './pages/create-import-bc-account/create-import-bc-account.page';
import { ImportBcAccountPage } from './pages/import-bc-account/import-bc-account.page';
import { BcAccountCreatedPage } from './pages/bc-account-created/bc-account-created.page';
import { OtpBcAccountPage } from './pages/otp-bc-account/otp-bc-account.page';
import { RequestOtpPage } from './pages/request-otp/request-otp.page';
import { MintCompletedPage } from './pages/mint-completed/mint-completed.page';

const routes: Routes = [
   { path: '', component: GetNftPage, canActivate: [AuthGuardService] },
   { path: 'get-nft', component: GetNftPage, canActivate: [AuthGuardService] },
   { path: 'login', component: LoginPage },
   { path: 'otp-page', component: OtpPage, canActivate: [AuthGuardService] },
   { path: 'mint-nft', component: MintNftPage, canActivate: [AuthGuardService] },
   { path: 'get-key', component: GetKeysPage, canActivate: [AuthGuardService] },
   { path: 'bc-account', component: BcAccountPage, canActivate: [AuthGuardService] },
   { path: 'add-account', component: AddAccountPage, canActivate: [AuthGuardService] },
   { path: 'svg-preview', component: PagesLoadSvgPage, canActivate: [AuthGuardService] },
   { path: 'otp-nft', component: OtpNtfComponent, canActivate: [AuthGuardService] },
   { path: 'psw-reset', component: ResetPasswordPage, canActivate: [AuthGuardService] },
   { path: 'content', component: ContentPage, canActivate: [AuthGuardService] },
   { path: 'help', component: HelpPage, canActivate: [AuthGuardService] },
   { path: 'setting', component: SettingsPage, canActivate: [AuthGuardService] },
   { path: 'setting-form', component: SettingFormPage, canActivate: [AuthGuardService] },
   { path: 'account-details', component: AccountDetailsPage, canActivate: [AuthGuardService] },
   { path: 'fund-transfer', component: FundTransferPage, canActivate: [AuthGuardService] },
   { path: 'transfer-confirm', component: TransferConfirmPage, canActivate: [AuthGuardService] },
   { path: 'item-detail', component: ItemDetailPage, canActivate: [AuthGuardService] },
   { path: 'account-info', component: AccountInfoPage, canActivate: [AuthGuardService] },

   {
      path: 'tabs',
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
   {
      path: 'create-account',
      component: CreateAccountPage,
   },
   {
      path: 'request-delete',
      component: RequestDeletePage,
   },
   {
      path: 'create-import-bc-account',
      component: CreateImportBcAccountPage,
   },
   {
      path: 'import-bc-account',
      component: ImportBcAccountPage,
   },
   {
      path: 'bc-account-created',
      component: BcAccountCreatedPage,
   },
   {
      path: 'otp-bc-account',
      component: OtpBcAccountPage,
      canActivate: [AuthGuardService],
   },
   {
      path: 'request-otp',
      component: RequestOtpPage,
   },
   {
      path: 'mint-completed',
      component: MintCompletedPage,
   },
];

@NgModule({
   imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
   exports: [RouterModule],
})
export class AppRoutingModule {}
