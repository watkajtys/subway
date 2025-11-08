import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StationSearch } from './station-search';

describe('StationSearch', () => {
  let component: StationSearch;
  let fixture: ComponentFixture<StationSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StationSearch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StationSearch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
