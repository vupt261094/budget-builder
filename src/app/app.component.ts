import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {BudgetService} from "./services/budget.service";
import {DateRangePickerComponent} from "./components/date-range-picker/date-range-picker.component";
import {BudgetTableComponent} from "./components/budget-table/budget-table.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DateRangePickerComponent, BudgetTableComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'angular-budget-builder';
  constructor(private budgetService: BudgetService) {}

  onDateRangeSelected(dateRange: { startDate: string, endDate: string }) {
    this.budgetService.setDateRange(dateRange.startDate, dateRange.endDate);
  }
}
