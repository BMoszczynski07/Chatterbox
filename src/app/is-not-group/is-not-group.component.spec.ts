import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IsNotGroupComponent } from './is-not-group.component';

describe('IsNotGroupComponent', () => {
  let component: IsNotGroupComponent;
  let fixture: ComponentFixture<IsNotGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IsNotGroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IsNotGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
