import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineFormComponent } from './timeline-form.component';

describe('TimelineFormComponent', () => {
  let component: TimelineFormComponent;
  let fixture: ComponentFixture<TimelineFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimelineFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimelineFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});