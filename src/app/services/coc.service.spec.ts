import { TestBed } from '@angular/core/testing';

import { COCService } from './coc.service';

describe('COCService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: COCService = TestBed.get(COCService);
    expect(service).toBeTruthy();
  });
});
