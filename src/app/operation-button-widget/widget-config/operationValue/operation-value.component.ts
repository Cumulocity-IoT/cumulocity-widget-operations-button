import { Component, EventEmitter, Input, Output, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CoreModule } from '@c8y/ngx-components';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-operation-value',
  templateUrl: './operation-value.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, CoreModule]
})
export class OperationValueComponent implements OnDestroy {
  @Input() value: string = '{}';
  @Output() valueChange = new EventEmitter<string>();
  @Output() valueChangeDebounced = new EventEmitter<string>();

  isValidJson: boolean = true;
  private valueSubject = new Subject<string>();

  constructor() {
    // Emit after user stops typing for 500ms
    this.valueSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(value => {
      this.valueChangeDebounced.emit(value);
    });
  }

  onUpdate(newValue: string): void {
    this.value = newValue;
    this.validateJson(newValue);
    this.valueChange.emit(newValue);
    this.valueSubject.next(newValue);
  }

  private validateJson(value: string): void {
    try {
      JSON.parse(value);
      this.isValidJson = true;
    } catch (error) {
      this.isValidJson = false;
    }
  }

  ngOnDestroy(): void {
    this.valueSubject.complete();
  }
}