import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Searchbar, ViewController, LoadingController, ToastController, Toast, AlertController } from 'ionic-angular';
import { SelectSearchable } from './select';
import { ConnectivityServiceProvider } from '../../providers/connectivity-service/connectivity-service';
import { ApiServiceProvider } from '../../providers/api-service/api-service';

@Component({
    selector: 'select-searchable-page',
    templateUrl: 'select-page.html',
    host: {
        'class': 'select-searchable-page',
        '[class.select-searchable-page-can-reset]': 'selectComponent.canReset',
        '[class.select-searchable-page-multiple]': 'selectComponent.multiple'
    }
})
export class SelectSearchablePage {
    selectComponent: SelectSearchable;
    filteredItems: any[];
    selectedItems: any[] = [];
    navController: NavController;
    @ViewChild('searchbarComponent') searchbarComponent: Searchbar;
    loading: any;
    private toastInstance: Toast;

    constructor(private navParams: NavParams, private viewCtrl: ViewController, private connectivity: ConnectivityServiceProvider, private loadingCtrl: LoadingController, private apiService: ApiServiceProvider,
        public alertCtrl: AlertController,
        public toastCtrl: ToastController,


    ) {
        this.selectComponent = this.navParams.get('selectComponent');
        // this.navController = navParams.get('navController');
        this.filteredItems = this.selectComponent.items;
        this.filterItems();

        if (this.selectComponent.value) {
            if (this.selectComponent.multiple) {
                this.selectComponent.value.forEach(item => {
                    this.selectedItems.push(item);
                });
            } else {
                this.selectedItems.push(this.selectComponent.value);
            }
        }
    }

    ngAfterViewInit() {
        // if (this.searchbarComponent) {
        //     // Focus after a delay because focus doesn't work without it.
        //     setTimeout(() => {
        //         this.searchbarComponent.setFocus();
        //     }, 1000);
        // }
    }

    ionViewWillLeave() {
        // this.close();
        if (!this.selectComponent.hasSearchEvent) {
            this.selectComponent.filterText = '';
        }
    }

    isItemSelected(item: any) {
        return this.selectedItems.find(selectedItem => {
            if (this.selectComponent.itemValueField) {
                return item[this.selectComponent.itemValueField] === selectedItem[this.selectComponent.itemValueField];
            }

            return item === selectedItem;
        }) !== undefined;
    }

    deleteSelectedItem(item: any) {
        let itemToDeleteIndex;

        this.selectedItems.forEach((selectedItem, itemIndex) => {
            if (this.selectComponent.itemValueField) {
                if (item[this.selectComponent.itemValueField] === selectedItem[this.selectComponent.itemValueField]) {
                    itemToDeleteIndex = itemIndex;
                }
            } else if (item === selectedItem) {
                itemToDeleteIndex = itemIndex;
            }
        });

        this.selectedItems.splice(itemToDeleteIndex, 1);
    }

    addSelectedItem(item: any) {
        this.selectedItems.push(item);
    }

        /**
* @desc get public key from admin (name - public key mapping)  
* @param string $name - the name to be mapped with public key
* @author Jaje thananjaje3@gmail.com
* @return public key as a string
*/
    getPublickey(name) {
        if (this.connectivity.onDevice) {
            this.presentLoading();
            return new Promise((resolve, reject) => {

                this.apiService.getPublickey(name).then((res) => {
                    this.dissmissLoading();
                    if (res.status === 200) {
                        console.log(res.body)
                        resolve(res.body.pk)
                    } else if (res.status === 404) {
                        this.userError(name, 'Public key not found');
                        reject()
                    }
                })
                    .catch((error) => {
                        this.dissmissLoading();
                        this.userError(name, 'Public key not found');
                        console.log(error);
                        reject()
                    });
            })

        } else {
            this.presentToast('There is no internet at the moment.');
        }
    }

    select(item: any) {
        if (this.selectComponent.multiple) {
            if (this.isItemSelected(item)) {
                this.deleteSelectedItem(item);
            } else {
                this.addSelectedItem(item);
            }
        } else {
            if (!this.isItemSelected(item)) {
                this.selectedItems = [];
                this.addSelectedItem(item);
                this.selectComponent.select(item);
            }

            this.close();
        }
    }

    ok() {
        this.selectComponent.select(this.selectedItems.length ? this.selectedItems : null);
        this.close();
    }

    close() {
        // Focused input interferes with the animation.
        // Blur it first, wait a bit and then close the page.
        if (this.searchbarComponent) {
            this.searchbarComponent._fireBlur();
        }

        setTimeout(() => {
            // this.navController.pop();
            this.viewCtrl.dismiss();
            if (!this.selectComponent.hasSearchEvent) {
                this.selectComponent.filterText = '';
            }
        });
    }

    reset() {
        // this.navController.pop();
        this.viewCtrl.dismiss();
        this.selectComponent.reset();
    }

    filterItems() {
        console.log(this.selectComponent.filterText);
        if (this.selectComponent.hasSearchEvent) {
            if (this.selectComponent.isNullOrWhiteSpace(this.selectComponent.filterText)) {
                this.selectComponent.items = [];
            } else {
                // Delegate filtering to the event.
                this.selectComponent.emitSearch();
            }
        } else {
            // Default filtering.
            if (!this.selectComponent.filterText || !this.selectComponent.filterText.trim()) {
                this.filteredItems = this.selectComponent.items;
                return;
            }

            let filterText = this.selectComponent.filterText.trim().toLowerCase();
            this.getPublickey(this.selectComponent.filterText)
                .then((pk) => {
                    if (pk) {
                        this.filteredItems = [pk];
                    } else {
                        this.filteredItems = this.selectComponent.items.filter(item => {
                            if (typeof item === 'object') {
                                return item[this.selectComponent.itemTextField].toLowerCase().indexOf(filterText.toLowerCase()) > -1;
                            }
                            return item.toLowerCase().indexOf(filterText.toLowerCase()) > -1;
                        });
                    }
                })
                .catch((err) => console.log(err))

        }
    }

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
            content: 'Please Wait'
        });
        // });
        this.loading.present();
    }

    dissmissLoading() {
        this.loading.dismiss();
    }
}
