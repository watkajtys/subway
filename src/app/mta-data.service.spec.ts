import { TestBed } from '@angular/core/testing';

import { MtaDataService } from './mta-data.service';

describe('MtaDataService', () => {
  let service: MtaDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MtaDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
