import { Component, EventEmitter, HostListener, Input, OnChanges, OnDestroy, Optional, Output,  SimpleChanges, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Form,  IonicFormInput, Item, ModalController, ModalOptions, Platform } from 'ionic-angular';
import { SelectSearchablePage } from './select-page';

@Component({
    selector: 'select-searchable',
    templateUrl: 'select.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => SelectSearchable),
        multi: true
    }],
    host: {
        'class': 'select-searchable',
        '[class.select-searchable-ios]': 'isIos',
        '[class.select-searchable-md]': 'isMd',
        '[class.select-searchable-can-reset]': 'canReset'
    }
})
export class SelectSearchable implements ControlValueAccessor, IonicFormInput, OnDestroy, OnChanges {
    private _items: any[] = [];
    isIos: boolean;
    isMd: boolean;
    filterText = '';
    value: any = null;
    hasSearchEvent: boolean;
    get items(): any[] {
        return this._items;
    }
    @Input('items')
    set items(items: any[]) {
        console.log(items)

        // The original reference of the array should be preserved to keep two-way data binding working between SelectSearchable and SelectSearchablePage.
        this._items.splice(0, this._items.length);

        // Add new items to the array.
        Array.prototype.push.apply(this._items, items);
    }
    @Input() isSearching: boolean;
    @Input() itemValueField: string;
    @Input() itemTextField: string;
    @Input() canSearch = false;
    @Input() canReset = false;
    @Input() title: string;
    @Input() searchPlaceholder: string = 'Search';
    @Input() emptyMessage: string = 'NoI';
    @Output() onChange: EventEmitter<any> = new EventEmitter();
    @Output() onSearch: EventEmitter<any> = new EventEmitter();
    @Input() itemTemplate: Function;
    @Input() multiple: boolean;

    constructor(
        private modalCtrl: ModalController,
        private ionForm: Form,
        private platform: Platform,
        @Optional() private ionItem: Item
    ) { }

    isNullOrWhiteSpace(value: any): boolean {
        if (value === null || value === undefined) {
            return true;
        }

        // Convert value to string in case if it's not.
        return value.toString().replace(/\s/g, '').length < 1;
    }

    ngOnInit() {
        this.isIos = this.platform.is('ios');
        this.isMd = this.platform.is('android');
        this.hasSearchEvent = this.onSearch.observers.length > 0;
        this.ionForm.register(this);
        if (this.ionItem) {
            this.ionItem.setElementClass('item-select-searchable', true);
        }
    }

    initFocus() { }
    @HostListener('click', ['$event'])
    _click(event: UIEvent) {
        if (event.detail === 0) {
            // Don't continue if the click event came from a form submit.
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        this.open();
    }

    select(selectedItem: any) {
        this.value = selectedItem;
        console.log(selectedItem);
        this.emitChange();
    }

    emitChange() {
        this.propagateChange(this.value);
        this.onChange.emit({
            component: this,
            value: this.value
        });        
    }

    emitSearch() {
        this.onSearch.emit({
            component: this,
            text: this.filterText
        });
    }

    open() {
        let options: ModalOptions = {
            showBackdrop: true,
            enableBackdropDismiss: true,
            cssClass: 'my-modal'
        };
        let selectModal = this.modalCtrl.create(SelectSearchablePage, {selectComponent: this}, options);
        selectModal.present();
        // this.navController.push(SelectSearchablePage, {
        //     selectComponent: this,
        //     navController: this.navController
        // });
    }

    reset() {
        this.setValue(null);
        this.emitChange();
    }

    formatItem(value: any): string {
        if (this.itemTemplate) {
            return this.itemTemplate(value);
        }

        // if itemTextField is empty return full value(ie not an object) TODO getting an empty string here
        if ((this.itemTextField === null || this.itemTextField === undefined || this.itemTextField === '')) {
            return value;
        }

        return value ? value[this.itemTextField] : null;
    }

    formatValue(): string {
        if (!this.value) {
            return null;
        }

        if (this.multiple) {
            return this.value.map(item => this.formatItem(item)).join(', ');
        } else {
            return this.formatItem(this.value);
        }
    }

    private propagateChange = (_: any) => { };

    writeValue(value: any) {
        this.setValue(value);
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any) { }

    setDisabledState(isDisabled: boolean) { }

    ngOnDestroy() {
        this.ionForm.deregister(this);
    }

    setValue(value: any) {
        this.value = value;
        console.log(value)
        // Get an item from the list for value.
        // We need this in case value contains only id, which is not sufficient for template rendering.
        if (this.value && !this.isNullOrWhiteSpace(this.value[this.itemValueField])) {
            let selectedItem = this.items.find(item => {
                return item[this.itemValueField] === this.value[this.itemValueField];
            });

            if (selectedItem) {
                this.value = selectedItem;
            }
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['items'] && this.items.length > 0) {
            this.setValue(this.value);
        }
    }
}

