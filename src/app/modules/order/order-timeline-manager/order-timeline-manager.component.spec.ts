import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderTimelineManagerComponent } from './order-timeline-manager.component';

describe('OrderTimelineManagerComponent', () => {
  let component: OrderTimelineManagerComponent;
  let fixture: ComponentFixture<OrderTimelineManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderTimelineManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderTimelineManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});