import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExcelUploadComponentComponent } from './excel-upload-component.component';

describe('ExcelUploadComponentComponent', () => {
  let component: ExcelUploadComponentComponent;
  let fixture: ComponentFixture<ExcelUploadComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExcelUploadComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExcelUploadComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
