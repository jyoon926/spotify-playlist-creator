import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArcsComponent } from './arcs.component';

describe('ArcsComponent', () => {
  let component: ArcsComponent;
  let fixture: ComponentFixture<ArcsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ArcsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArcsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
