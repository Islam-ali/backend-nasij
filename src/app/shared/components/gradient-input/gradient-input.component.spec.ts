import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { GradientInputComponent } from './gradient-input.component';

describe('GradientInputComponent', () => {
  let component: GradientInputComponent;
  let fixture: ComponentFixture<GradientInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GradientInputComponent, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(GradientInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should generate correct gradient string', () => {
    component.colors = ['#ff0000', '#00ff00'];
    component.direction = 'to right';
    expect(component.gradientString).toBe('linear-gradient(to right, #ff0000, #00ff00)');
  });

  it('should handle multiple colors', () => {
    component.colors = ['#ff0000', '#00ff00', '#0000ff'];
    component.direction = '135deg';
    expect(component.gradientString).toBe('linear-gradient(135deg, #ff0000, #00ff00, #0000ff)');
  });

  it('should return transparent for empty colors', () => {
    component.colors = [];
    expect(component.gradientString).toBe('transparent');
  });

  it('should implement ControlValueAccessor', () => {
    const value = 'test value';
    component.writeValue(value);
    expect(component).toBeTruthy(); // Should not throw error
  });

  it('should update gradient on input changes', () => {
    spyOn(component, 'updateGradientDisplay');
    component.ngOnChanges({
      colors: {
        currentValue: ['#000'],
        previousValue: ['#fff'],
        firstChange: false,
        isFirstChange: () => false
      }
    });
    expect(component.updateGradientDisplay).toHaveBeenCalled();
  });
});