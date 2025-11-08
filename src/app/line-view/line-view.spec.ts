import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';

import { LineViewComponent } from './line-view';

describe('LineViewComponent', () => {
  let component: LineViewComponent;
  let fixture: ComponentFixture<LineViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LineViewComponent, HttpClientTestingModule],
      providers: [provideRouter([]), provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(LineViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

