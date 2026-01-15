import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { GradientBuilderComponent } from './gradient-builder.component';

describe('GradientBuilderComponent', () => {
  let component: GradientBuilderComponent;
  let fixture: ComponentFixture<GradientBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GradientBuilderComponent, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(GradientBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should generate correct gradient string', () => {
    component.gradientForm.get('colors')?.setValue(['#ff0000', '#00ff00']);
    component.gradientForm.get('direction')?.setValue('to right');
    expect(component.currentGradient).toBe('linear-gradient(to right, #ff0000, #00ff00)');
  });

  it('should handle multiple colors', () => {
    component.gradientForm.get('colors')?.setValue(['#ff0000', '#00ff00', '#0000ff']);
    component.gradientForm.get('direction')?.setValue('135deg');
    expect(component.currentGradient).toBe('linear-gradient(135deg, #ff0000, #00ff00, #0000ff)');
  });

  it('should add color', () => {
    const initialLength = component.colorsArray.length;
    component.addColor('#ff0000');
    expect(component.colorsArray.length).toBe(initialLength + 1);
  });

  it('should remove color', () => {
    component.addColor('#ff0000');
    const lengthAfterAdd = component.colorsArray.length;
    component.removeColor(lengthAfterAdd - 1);
    expect(component.colorsArray.length).toBe(lengthAfterAdd - 1);
  });

  it('should set direction', () => {
    component.setDirection('135deg');
    expect(component.gradientForm.get('direction')?.value).toBe('135deg');
  });

  it('should load preset', () => {
    const preset = { name: 'Test', colors: ['#ff0000', '#00ff00'] };
    component.loadPreset(preset);
    expect(component.colorsArray.value).toEqual(['#ff0000', '#00ff00']);
  });

  it('should emit gradient change', () => {
    spyOn(component.gradientChange, 'emit');
    component.addColor('#ff0000');
    expect(component.gradientChange.emit).toHaveBeenCalled();
  });

  it('should update from input changes', () => {
    component.ngOnChanges({
      initialColors: {
        currentValue: ['#000000'],
        previousValue: ['#ffffff'],
        firstChange: false,
        isFirstChange: () => false
      }
    });
    expect(component.colorsArray.value).toEqual(['#000000']);
  });
});