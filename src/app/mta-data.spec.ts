import { TestBed } from '@angular/core/testing';

import { MtaData } from './mta-data';

describe('MtaData', () => {
  let service: MtaData;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MtaData);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
