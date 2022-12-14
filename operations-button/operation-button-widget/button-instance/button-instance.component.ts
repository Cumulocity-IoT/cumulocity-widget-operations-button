import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IOperationButtonConfig } from '../models/IOperationButtonWidgetConfig';

@Component({
  selector: 'app-button-instance',
  templateUrl: './button-instance.component.html',
})
export class ButtonInstanceComponent {
  @Input() config: IOperationButtonConfig;
  @Output() click = new EventEmitter<IOperationButtonConfig>();

  onButtonClick(event: Event): void {
    event.stopPropagation();
    this.click.emit(this.config);
  }
}
