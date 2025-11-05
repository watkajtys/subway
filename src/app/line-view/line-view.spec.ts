import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LineView } from './line-view';

describe('LineView', () => {
  let component: LineView;
  let fixture: ComponentFixture<LineView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LineView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LineView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
