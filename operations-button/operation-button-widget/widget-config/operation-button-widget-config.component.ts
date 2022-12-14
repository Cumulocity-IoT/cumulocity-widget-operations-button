import { Component, Input } from '@angular/core';
import { ICONS } from '@c8y/ngx-components';
import { IOperationButtonWidgetConfig } from '../models/IOperationButtonWidgetConfig';

@Component({
  selector: 'app-operation-button-widget-config',
  templateUrl: './operation-button-widget-config.component.html',
})
export class OperationButtonWidgetConfigComponent {




  @Input() config: IOperationButtonWidgetConfig = {};
  buttonClasses = [
    'btn-default',
    'btn-primary',
    'btn-secondary',
    'btn-success',
    'btn-danger',
    'btn-emphasis',
    'btn-info',
    'btn-warning',
    'btn-link',
  ];
  availableIcons: string[] = ['play', 'stop', 'rotate-left', 'rotate-right', ...ICONS];

  addNewButton(): void {
    if (!this.config.buttons) {
      this.config.buttons = [];


    }

    this.config.buttons.push({
      icon: 'refresh',
      label: 'Restart',
      description: 'Restart device',
      operationFragment: 'c8y_Restart',
      buttonClasses: 'btn-warning',
      operationValue: '{}',
      showModal: false,
      modalText: "Confirm device restart"
    });
  }

  removeButton(index: number): void {
    this.config.buttons.splice(index, 1);
  }
}
