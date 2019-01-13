import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ModalController, ToastController, LoadingController, Toast } from 'ionic-angular';
import { AddAccountPage } from '../add-account/add-account';
import { Api } from '../../providers';
import { ConnectivityServiceProvider } from '../../providers/connectivity-service/connectivity-service';
 
@IonicPage()
@Component({
  selector: 'page-bc-account',
  templateUrl: 'bc-account.html',
})
export class BcAccountPage {
  private toastInstance: Toast;
  loading;
userAcc = {
  "name":"jack",
  "email":"jack@gmail.com",
  "password":"jack123",
  "MainAccounts":[]
  //                 {"AccountName":"Acc 1",
  //                  "pk":"GABVKLID4CFOSRWBCIMNEGMLZUO4YWLUY2KVQXVMIQUTIXRFHXYXHZ2Q",
  //                  "sk":"SCH72XX5KLTPF4EGAUPADFBWR6HEIOLFWFIUC66TVK2WMBL6MXRAU5CT",
  //                  "subAccounts":["GABVKLID4CFOSRWBCIMNEGMLZUO4YWLUY2KVQXVMIQUTIXRFHXYXHZ2Q"]
  //                 },
  //                 {"AccountName":"Registrar",
  //                  "pk":"GABVKLID4CFOSRWBCIMNEGMLZUO4YWLUY2KVQXVMIQUTIXRFHXYXHZ2Q",
  //                  "sk":"SCH72XX5KLTPF4EGAUPADFBWR6HEIOLFWFIUC66TVK2WMBL6MXRAU5CT",
  //                  "subAccounts":["GABVKLID4CFOSRWBCIMNEGMLZUO4YWLUY2KVQXVMIQUTIXRFHXYXHZ2Q",                                            "GABVKLID4CFOSRWBCIMNEGMLZUO4YWLUY2KVQXVMIQUTIXRFHXYXHZ2Q",
  //                                 "SCH72XX5KLTPF4EGAUPADFBWR6HEIOLFWFIUC66TVK2WMBL6MXRAU5CT"
  //                                ]
  //                 },
  //                 {"AccountName":"Field Officer",
  //                  "pk":"GABVKLID4CFOSRWBCIMNEGMLZUO4YWLUY2KVQXVMIQUTIXRFHXYXHZ2Q",
  //                  "sk":"SCH72XX5KLTPF4EGAUPADFBWR6HEIOLFWFIUC66TVK2WMBL6MXRAU5CT",
  //                  "subAccounts":[ ]
  //                 },
  //                 {"AccountName":"Acc 1",
  //                  "pk":"GABVKLID4CFOSRWBCIMNEGMLZUO4YWLUY2KVQXVMIQUTIXRFHXYXHZ2Q",
  //                  "sk":"SCH72XX5KLTPF4EGAUPADFBWR6HEIOLFWFIUC66TVK2WMBL6MXRAU5CT",
  //                  "subAccounts":["GABVKLID4CFOSRWBCIMNEGMLZUO4YWLUY2KVQXVMIQUTIXRFHXYXHZ2Q"]
  //                 },
  //                 {"AccountName":"Registrar",
  //                  "pk":"GABVKLID4CFOSRWBCIMNEGMLZUO4YWLUY2KVQXVMIQUTIXRFHXYXHZ2Q",
  //                  "sk":"SCH72XX5KLTPF4EGAUPADFBWR6HEIOLFWFIUC66TVK2WMBL6MXRAU5CT",
  //                  "subAccounts":["GABVKLID4CFOSRWBCIMNEGMLZUO4YWLUY2KVQXVMIQUTIXRFHXYXHZ2Q",                                            "GABVKLID4CFOSRWBCIMNEGMLZUO4YWLUY2KVQXVMIQUTIXRFHXYXHZ2Q",
  //                                 "SCH72XX5KLTPF4EGAUPADFBWR6HEIOLFWFIUC66TVK2WMBL6MXRAU5CT"
  //                                ]
  //                 },
  //                 {"AccountName":"Field Officer",
  //                  "pk":"GABVKLID4CFOSRWBCIMNEGMLZUO4YWLUY2KVQXVMIQUTIXRFHXYXHZ2Q",
  //                  "sk":"SCH72XX5KLTPF4EGAUPADFBWR6HEIOLFWFIUC66TVK2WMBL6MXRAU5CT",
  //                  "subAccounts":[ ]
  //                 }
  //               ]
  
}
  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    public modalCtrl: ModalController,
    private api: Api,
    private connectivity: ConnectivityServiceProvider,
    public toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    public alertCtrl: AlertController,) {

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BcAccountPage');
  }

  goToAddAccount(){
    this.navCtrl.push(AddAccountPage);

  }

  doRefresh(refresher) {
    this.presentLoading();
    console.log('Begin async operation', refresher);
    // this.loadCOCSent();
    // setTimeout(() => {
    //   console.log('Async operation has ended');
    refresher.complete();
    // }, 2000);
  }

  // doLogin() {
  //   if (this.connectivity.onDevice) {
  //     this.presentLoading();
  //     const authmodel = {
  //       userName: this.form.value.username,
  //       password: this.form.value.password,
  //       newPassword: 'none'
  //     };

  //     this.authService.validateUser(authmodel).then((res) => {
  //       console.log(res.body.Token);
  //       this.dissmissLoading();
  //       if (res.status === 200) {
  //         localStorage.setItem('_token', JSON.stringify(res.body.Token))
  //         this.navCtrl.setRoot(TabsPage);
  //       } else if (res.status === 205) {
  //         this.gotoPasswordResetPage(this.form.value.username, this.form.value.password);
  //       } else if (res.status === 403) {
  //         this.userError('authenticationFailed', 'accountIsBlocked');
  //       } else {
  //         this.userError('authenticationFailed', 'authenticationFailedDescription');
  //       }
  //     })
  //       .catch((error) => {
  //         this.dissmissLoading();
  //         this.userError('authenticationFailed', 'authenticationFailedDescription');
  //         console.log(error);
  //       });
  //   } else {
  //     this.presentToast('noInternet');
  //   }
  // }

  userError(title, message) {
    let alert = this.alertCtrl.create();
    alert.setTitle(title);
    alert.setMessage(message);
    alert.addButton({
      text: 'OK'
    });
    alert.present();
  }

  presentToast(message) {
    if (this.toastInstance) {
      return;
    }

    this.toastInstance = this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'middle'
    });

    this.toastInstance.onDidDismiss(() => {
      this.toastInstance = null;
    });
    this.toastInstance.present();
  }

  presentLoading() {
    // this.translate.get(['pleasewait']).subscribe(text => {
    this.loading = this.loadingCtrl.create({
      dismissOnPageChange: false,
      content: 'pleasewait'
    });
    // });
    this.loading.present();
  }

  dissmissLoading() {
    this.loading.dismiss();
  }

}


