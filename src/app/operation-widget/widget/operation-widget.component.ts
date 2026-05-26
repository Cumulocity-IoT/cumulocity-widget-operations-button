import { Component, Input, OnChanges } from '@angular/core';
import { OperationService } from '@c8y/client';
import { AlertService, CommonModule, CoreModule, FormsModule } from '@c8y/ngx-components';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { OperationButtonComponent } from '../button/operation-button.component';
import { IOperationButtonConfig, IOperationWidgetConfig } from '../models/operation-widget-model';
import {
  parseReferencedVariables,
  reconcileOperationVariables,
  substituteVariables
} from '../models/operation-variables.util';

interface ButtonRuntimeState {
  values: Record<string, string | number>;
  expanded: boolean;
}

@Component({
  selector: 'app-operation-widget',
  templateUrl: './operation-widget.component.html',
  styleUrls: ['./operation-widget.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, CoreModule, CollapseModule, OperationButtonComponent]
})
export class OperationWidgetComponent implements OnChanges {
  @Input() config: IOperationWidgetConfig = {};

  // Keyed by button object identity rather than index so reordering/removing
  // buttons in the config doesn't corrupt state.
  private state = new WeakMap<IOperationButtonConfig, ButtonRuntimeState>();

  constructor(
    private operationsService: OperationService,
    private alertService: AlertService
  ) {}

  ngOnChanges(): void {
    if (!this.config?.buttons) return;

    for (const button of this.config.buttons) {
      if (!button.operationVariables || button.operationVariables.length === 0) {
        const found = parseReferencedVariables(button.operationValue);
        if (found.length > 0) {
          button.operationVariables = reconcileOperationVariables(found);
        }
      }

      if (!this.state.has(button)) {
        const values: Record<string, string | number> = {};
        for (const v of button.operationVariables ?? []) {
          values[v.varName] = v.default ?? '';
        }
        this.state.set(button, { values, expanded: false });
      }
    }
  }

  hasVariables(button: IOperationButtonConfig): boolean {
    return !!button.operationVariables?.length;
  }

  toggleVariables(button: IOperationButtonConfig): void {
    const s = this.state.get(button);
    if (s) s.expanded = !s.expanded;
  }

  isExpanded(button: IOperationButtonConfig): boolean {
    return this.state.get(button)?.expanded ?? false;
  }

  getVariableValues(button: IOperationButtonConfig): Record<string, string | number> {
    return this.state.get(button)?.values ?? {};
  }

  onButtonClick(button: IOperationButtonConfig): void {
    if (!this.validateVariables(button)) return;

    if (!this.config.device?.id) {
      this.alertService.danger('No target device configured for this widget. Unable to create operation.');
      return;
    }

    let operationValue = button.operationValue;
    const varValues = this.state.get(button)?.values;
    if (varValues && Object.keys(varValues).length > 0) {
      operationValue = substituteVariables(operationValue, varValues, button);
    }

    let parsedOperationValue: unknown;
    try {
      parsedOperationValue = JSON.parse(operationValue);
    } catch {
      this.alertService.danger(`Invalid operation value for '${button.buttonLabel}'. Please check the configuration.`);
      return;
    }

    const description = button.buttonTitle || button.buttonLabel;
    const payload = button.customOperation
      ? { deviceId: this.config.device.id, description, ...(parsedOperationValue as object) }
      : { deviceId: this.config.device.id, description, [button.operationFragment]: parsedOperationValue };

    this.operationsService
      .create(payload)
      .then(() => this.alertService.success(`Operation '${button.buttonLabel}' successfully created.`))
      .catch(error => {
        console.error('Operation creation failed:', error);
        this.alertService.danger(`Failed to create '${button.buttonLabel}' operation.`);
      });
  }

  private validateVariables(button: IOperationButtonConfig): boolean {
    if (!button.operationVariables?.length) return true;

    const values = this.state.get(button)?.values ?? {};
    const missing = button.operationVariables.filter(variable => {
      const value = values[variable.varName];
      if (value === null || value === undefined) return true;
      if (typeof value === 'string' && value.trim() === '') return true;
      if (variable.type === 'number') {
        const stringValue = String(value).trim();
        return stringValue === '' || isNaN(Number(value));
      }
      return !value;
    });

    if (missing.length > 0) {
      const varNames = missing.map(v => v.label).join(', ');
      this.alertService.warning(`Please provide values for the following variables: ${varNames}`);
      return false;
    }

    return true;
  }
}
