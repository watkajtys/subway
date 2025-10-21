import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartureBoard } from './departure-board';

describe('DepartureBoard', () => {
  let component: DepartureBoard;
  let fixture: ComponentFixture<DepartureBoard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartureBoard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepartureBoard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
