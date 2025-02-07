import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainComputerComponent } from './main-computer.component';

describe('MainComputerComponent', () => {
  let component: MainComputerComponent;
  let fixture: ComponentFixture<MainComputerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainComputerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainComputerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
