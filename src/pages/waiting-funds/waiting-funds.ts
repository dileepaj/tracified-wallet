import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { LoginPage } from '../../pages/login/login';
import { DataServiceProvider } from '../../providers/data-service/data-service';

@IonicPage()
@Component({
  selector: 'page-waiting-funds',
  templateUrl: 'waiting-funds.html',
})
export class WaitingFundsPage {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public platform: Platform,
    private dataService: DataServiceProvider
  ) { }

  exitApp() {
    this.platform.exitApp();
  }

  logOut() {
    this.dataService.clearLocalData();
    this.navCtrl.setRoot(LoginPage);
  }

}
