import { Component, Input } from '@angular/core';
import { IOperationButtonWidgetConfig } from '../models/IOperationButtonWidgetConfig';
import { ICONS } from './icons-constant';

@Component({
  selector: 'app-operation-button-widget-config',
  templateUrl: './operation-button-widget-config.component.html',
})
export class OperationButtonWidgetConfigComponent {
  public supportedOperations: string[] = [];

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
  availableIcons: string[] = [
    ...ICONS,
  ];

  addNewButton(): void {
    if (!this.config.buttons) {
      this.config.buttons = [];
    }

    this.config.buttons.push({
      icon: undefined,
      label: 'Restart',
      description: 'Restart device',
      operationFragment: 'c8y_Restart',
      buttonClasses: "btn-default",
      operationValue: '{}',
      showModal: false,
      modalText: 'Confirm device restart',
      customOperation: false,
    });

    if (this.config.device && this.config.device['c8y_SupportedOperations']) {
      this.supportedOperations = this.config.device['c8y_SupportedOperations'];
    }
  }

  removeButton(index: number): void {
    this.config.buttons.splice(index, 1);
  }
}
