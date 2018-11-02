import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionPage } from './transaction.page';

describe('TransactionPage', () => {
  let component: TransactionPage;
  let fixture: ComponentFixture<TransactionPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
