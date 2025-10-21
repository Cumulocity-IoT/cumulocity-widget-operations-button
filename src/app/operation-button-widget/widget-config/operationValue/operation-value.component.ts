import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '@c8y/ngx-components';

@Component({
  selector: 'app-operation-value',
  templateUrl: './operation-value.component.html',
  standalone: true,
  imports: [CoreModule, CommonModule]
})
export class OperationValueComponent implements OnInit {
  @Input() value: string;
  @Output() valueChange = new EventEmitter<string>();
  isValidJson: boolean = true;
  onUpdate(event: Event) {
    this.isValidJson = this.validJson(this.value);
    this.valueChange.emit(this.value);
  }

  ngOnInit() {
    this.isValidJson = this.validJson(this.value);
  }

  private validJson(value: string): boolean {
    try {
      JSON.parse(this.value);
      return true;
    } catch (e) {
      this.isValidJson = false;
      return false;
    }
  }
}
