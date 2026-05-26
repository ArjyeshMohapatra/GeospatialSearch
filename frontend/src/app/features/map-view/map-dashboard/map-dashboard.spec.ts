import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapDashboard } from './map-dashboard';

describe('MapDashboard', () => {
  let component: MapDashboard;
  let fixture: ComponentFixture<MapDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(MapDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
