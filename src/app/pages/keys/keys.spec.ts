import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Keys } from './keys';

describe('Keys', () => {
  let component: Keys;
  let fixture: ComponentFixture<Keys>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Keys],
    }).compileComponents();

    fixture = TestBed.createComponent(Keys);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
