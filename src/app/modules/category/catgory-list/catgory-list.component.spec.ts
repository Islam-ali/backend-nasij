import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatgoryListComponent } from './catgory-list.component';

describe('CatgoryListComponent', () => {
  let component: CatgoryListComponent;
  let fixture: ComponentFixture<CatgoryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatgoryListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CatgoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
