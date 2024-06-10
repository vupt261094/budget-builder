import { Injectable, Signal } from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private dateRangeSubject = new Subject<{ startDate: string, endDate: string }>();
  dateRange$ = this.dateRangeSubject.asObservable();

  setDateRange(startDate: string, endDate: string) {
    this.dateRangeSubject.next({ startDate, endDate });
  }
}
