import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainPhoneComponent } from './main-phone.component';

describe('MainPhoneComponent', () => {
  let component: MainPhoneComponent;
  let fixture: ComponentFixture<MainPhoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainPhoneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainPhoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
