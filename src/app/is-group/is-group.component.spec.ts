import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IsGroupComponent } from './is-group.component';

describe('IsGroupComponent', () => {
  let component: IsGroupComponent;
  let fixture: ComponentFixture<IsGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IsGroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IsGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
