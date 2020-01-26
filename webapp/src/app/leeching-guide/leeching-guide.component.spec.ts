import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LeechingGuideComponent } from './leeching-guide.component';

describe('DashboardComponent', () => {
  let component: LeechingGuideComponent;
  let fixture: ComponentFixture<LeechingGuideComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeechingGuideComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeechingGuideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
