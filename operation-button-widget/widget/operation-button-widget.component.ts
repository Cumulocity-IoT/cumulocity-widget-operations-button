import { Component, Input } from '@angular/core';
import { OperationService } from '@c8y/client';
import { AlertService } from '@c8y/ngx-components';
import {
  IOperationButtonConfig,
  IOperationButtonWidgetConfig,
} from '../models/IOperationButtonWidgetConfig';

@Component({
  selector: 'app-operation-button-widget',
  templateUrl: './operation-button-widget.component.html',
})
export class OperationButtonWidgetComponent {
  @Input() config: IOperationButtonWidgetConfig = {};
  buttons: IOperationButtonConfig[] = [];

  constructor(
    private operationsService: OperationService,
    private alertService: AlertService
  ) {}

  onButtonClick(button: IOperationButtonConfig): void {
    if (this.config.device && this.config.device.id) {
      this.operationsService
        .create({
          deviceId: this.config.device.id,
          description: button.description || button.label,
          [button.operationFragment]: JSON.parse(button.operationValue),
        })
        .then(() => {
          this.alertService.success(
            `Operation '${button.label}' successfully created.`
          );
        })
        .catch(() => {
          this.alertService.danger(
            `Failed to create '${button.label}' operation.`
          );
        });
    } else {
      this.alertService.danger(
        `No target device configured for this widget. Unable to create operation.`
      );
    }
  }
}
