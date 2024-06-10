import { Component, EventEmitter, Output, Signal } from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-date-range-picker',
  templateUrl: './date-range-picker.component.html',
  imports: [
    ReactiveFormsModule
  ],
  styleUrls: ['./date-range-picker.component.scss']
})
export class DateRangePickerComponent {
  startDate = new FormControl('');
  endDate = new FormControl('');

  @Output() dateRangeSelected = new EventEmitter<{ startDate: string, endDate: string }>();

  submitDateRange() {
    if (this.startDate.value && this.endDate.value) {
      this.dateRangeSelected.emit({ startDate: this.startDate.value, endDate: this.endDate.value });
    }
  }
}
