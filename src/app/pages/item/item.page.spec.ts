import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemPage } from './item.page';

describe('ItemPage', () => {
  let component: ItemPage;
  let fixture: ComponentFixture<ItemPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
