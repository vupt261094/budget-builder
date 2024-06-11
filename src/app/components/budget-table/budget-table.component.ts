import {
  Component,
  ElementRef,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { BudgetService } from '../../services/budget.service';
import { FormsModule } from '@angular/forms';
import { NgForOf } from '@angular/common';
import { ContextMenuModule } from '@perfectmemory/ngx-contextmenu';
import { AbsPipe } from '../../pipes/abs.pipe';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-budget-table',
  templateUrl: './budget-table.component.html',
  styleUrls: ['./budget-table.component.scss'],
  imports: [FormsModule, NgForOf, ContextMenuModule, AbsPipe],
  standalone: true,
})
export class BudgetTableComponent implements OnInit {
  incomeCategories = signal<any>([{ name: '', values: [] }]);
  expensesCategories = signal<any>([{ name: '', values: [] }]);
  months = signal<string[]>([]);
  totalIncome = signal<any>([]);
  totalExpenses = signal<any>([]);
  openingBalance = signal<any>([]);
  closingBalance = signal<any>([]);
  startDate = '';
  endDate = '';

  constructor(private budgetService: BudgetService, private el: ElementRef) {}

  ngOnInit() {
    this.budgetService.dateRange$.subscribe(({ startDate, endDate }) => {
      this.startDate = startDate;
      this.endDate = endDate;
      this.months.set(this.getMonthsArray(startDate, endDate));
      this.initializeIncomeCategories();
    });
  }

  getMonthsArray(start: string, end: string): string[] {
    const months = [];
    const startDate = new Date(start);
    const endDate = new Date(end);
    let currentDate = startDate;

    while (currentDate <= endDate) {
      months.push(
        currentDate.toLocaleString('default', {
          month: 'long',
          year: 'numeric',
        })
      );
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return months;
  }

  initializeIncomeCategories() {
    this.incomeCategories.set([
      { name: '', values: Array(this.months().length).fill(0) },
    ]);
    this.expensesCategories.set([
      { name: '', values: Array(this.months().length).fill(0) },
    ]);
    this.calculateTotalIncome();
    this.calculateTotalExpenses();
  }

  addIncomeCategory() {
    const newCategory = [
      { name: '', values: Array(this.months().length).fill(0) },
    ];
    this.incomeCategories.set([...this.incomeCategories(), ...newCategory]);

    setTimeout(() => {
      this.handleFocusCategoryInput(
        `#category-income-${this.incomeCategories().length - 1}-0`
      );
    });
  }

  addExpensesCategory() {
    const newCategory = [
      { name: '', values: Array(this.months().length).fill(0) },
    ];
    this.expensesCategories.set([...this.expensesCategories(), ...newCategory]);

    setTimeout(() => {
      this.handleFocusCategoryInput(
        `#category-expenses-${this.expensesCategories().length - 1}-0`
      );
    });
  }

  deleteIncomeCategory(index: number) {
    this.incomeCategories.set(
      this.incomeCategories().filter((_: any, i: number) => i !== index)
    );
    this.calculateTotalIncome();
  }

  deleteExpensesCategory(index: number) {
    this.expensesCategories.set(
      this.expensesCategories().filter((_: any, i: number) => i !== index)
    );
    this.calculateTotalExpenses();
  }

  onIncomeValueChange() {
    this.calculateTotalIncome();
  }

  onExpensesValueChange() {
    this.calculateTotalExpenses();
  }

  calculateTotalIncome() {
    this.totalIncome.set(Array(this.months().length).fill(0));
    this.incomeCategories().forEach((category: any) => {
      category.values.forEach((value: any, index: number) => {
        const temp = [...this.totalIncome()];
        temp[index] += value;
        this.totalIncome.set(temp);
      });
    });

    this.calculateBalance();
  }

  calculateTotalExpenses() {
    this.totalExpenses.set(Array(this.months().length).fill(0));
    this.expensesCategories().forEach((category: any) => {
      category.values.forEach((value: any, index: number) => {
        const temp = [...this.totalExpenses()];
        temp[index] += value;
        this.totalExpenses.set(temp);
      });
    });

    this.calculateBalance();
  }

  calculateBalance() {
    this.openingBalance.set(Array(this.months().length).fill(0));
    this.months().forEach((category: any, index: number) => {
      const temp = [...this.openingBalance()];
      const tempClosingBalance = [...this.closingBalance()];
      temp[index] = !index ? 0 : tempClosingBalance[index - 1];
      tempClosingBalance[index] =
        this.totalIncome()[index] -
        this.totalExpenses()[index] +
        (temp[index] || 0);
      this.openingBalance.set(temp);
      this.closingBalance.set(tempClosingBalance);
    });
  }

  applyToAllIncome(index: number, value: number) {
    this.months().forEach((month: string, i: number) => {
      this.incomeCategories()[index].values[i] = value;
    });
    this.calculateTotalIncome();
  }

  applyToAllExpenses(index: number, value: number) {
    this.months().forEach((month: string, i: number) => {
      this.expensesCategories()[index].values[i] = value;
    });
    this.calculateTotalExpenses();
  }

  handleTabIncome($event: any, colIdx: number, rowIdx: number) {
    // add new row if the last cell on Tab by check the column index and rowIndex
    if (
      $event.keyCode === 9 &&
      colIdx === this.months().length - 1 &&
      rowIdx === this.incomeCategories().length - 1
    ) {
      this.addIncomeCategory();
      $event.stopPropagation();

      this.handleFocusCategoryInput(`#category-income-${rowIdx + 1}-0`);
    }
  }

  handleTabExpenses($event: any, colIdx: number, rowIdx: number) {
    // add new row if the last cell on Tab by check the column index and rowIndex
    if (
      $event.keyCode === 9 &&
      colIdx === this.months().length - 1 &&
      rowIdx === this.expensesCategories().length - 1
    ) {
      this.addExpensesCategory();
      $event.stopPropagation();
      this.handleFocusCategoryInput(`#category-expenses-${rowIdx + 1}-0`);
    }
  }

  handleFocusCategoryInput(inputId: string) {
    setTimeout(() => {
      const nextCategoryInput = this.el.nativeElement.querySelector(
        `${inputId}`
      );

      if (nextCategoryInput) {
        nextCategoryInput.focus();
      }
    });
  }

  handleEnterIncome(rowIdx: number, colIdx: number) {
    if (rowIdx === this.incomeCategories().length - 1) {
      this.addIncomeCategory();
    } else {
      this.handleFocusCategoryInput(
        `#category-income-${rowIdx + 1}-${colIdx + 1}`
      );
    }
  }

  handleEnterExpenses(rowIdx: number, colIdx: number) {
    if (rowIdx === this.expensesCategories().length - 1) {
      this.addExpensesCategory();
    } else {
      this.handleFocusCategoryInput(
        `#category-expenses-${rowIdx + 1}-${colIdx + 1}`
      );
    }
  }
}
