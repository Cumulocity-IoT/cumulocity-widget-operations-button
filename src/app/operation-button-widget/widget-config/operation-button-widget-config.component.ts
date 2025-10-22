import { Component, inject, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { IOperationButtonWidgetConfig, IOperationVariable } from '../models/IOperationButtonWidgetConfig';
import { ICONS } from './icons-constant';
import { ControlContainer, FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OperationButtonWidgetComponent } from '../widget/operation-button-widget.component';
import { WidgetConfigService } from '@c8y/ngx-components/context-dashboard';
import { AlertService, CoreModule, DynamicComponent, HumanizePipe, IconDirective } from '@c8y/ngx-components';
import { OperationValueComponent } from './operationValue/operation-value.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

@Component({
  selector: 'app-operation-button-widget-config',
  templateUrl: './operation-button-widget-config.component.html',
  viewProviders: [{ provide: ControlContainer, useExisting: NgForm }],
  standalone: true,
  imports: [CoreModule, CommonModule, FormsModule, IconDirective, BsDropdownModule, OperationButtonWidgetComponent, OperationValueComponent]
})
export class OperationButtonWidgetConfigComponent implements DynamicComponent, OnInit {

  private readonly alert = inject(AlertService);
  private readonly humanizePipe = inject(HumanizePipe);

  private readonly widgetConfigService = inject(WidgetConfigService);
  public supportedOperations: string[] = [];

  @Input() config: IOperationButtonWidgetConfig = {};
  buttonTypes = [
    'btn-default',
    'btn-primary',
    'btn-danger',
    'btn-info',
    'btn-link',
    'btn-clean',
  ];

  buttonSizes = [
    'btn-lg',
    'btn-primary',
    'btn-sm',
    'btn-xs',
  ];
  availableIcons: string[] = [
    ...ICONS,
  ];

  @ViewChild('sampleWidgetPreview')
  set previewMapSet(template: TemplateRef<any>) {
    if (template) {
      this.widgetConfigService.setPreview(template);
      return;
    }
    this.widgetConfigService.setPreview(null);
  }

  ngOnInit(): void {
    this.widgetConfigService.addOnBeforeSave(config => {
      this.alert.success('Widget added successfully', JSON.stringify(config, null, 2));
      return true;
    });
  }

  addNewButton(): void {
    if (!this.config.buttons) {
      this.config.buttons = [];
    }

    this.config.buttons.push({
      icon: undefined,
      label: 'Restart',
      description: 'Restart device',
      operationFragment: 'c8y_Restart',
      buttonType: "btn-default",
      buttonSize: "btn-default",
      operationValue: '{}',
      showModal: false,
      modalText: 'Confirm device restart',
      customOperation: false,
      operationVariables: []
    });

    if (this.config.device && this.config.device['c8y_SupportedOperations']) {
      this.supportedOperations = this.config.device['c8y_SupportedOperations'];
    }
  }

  removeButton(index: number): void {
    this.config.buttons.splice(index, 1);
  }

  /**
   * Parse operation value and extract referenced variables
   * @param operationValue - The JSON string to parse
   * @returns Array of variable names found
   */
  parseReferencedVariables(operationValue: string): string[] {
    try {
      // Check if it's valid JSON first
      JSON.parse(operationValue);

      // Regular expression to match ${variableName} pattern
      const variableRegex = /\$\{([^}]+)\}/g;
      const variables: string[] = [];
      let match: RegExpExecArray | null;

      // Extract all matches from the original string
      while ((match = variableRegex.exec(operationValue)) !== null) {
        // Clean up the variable name - trim whitespace and remove any $ prefix
        let variableName = match[1].trim();
        // Remove leading $ if present
        if (variableName.startsWith('$')) {
          variableName = variableName.slice(1);
        }
        variables.push(variableName);
      }

      // Remove duplicates
      const uniqueVariables = [...new Set(variables)];

      if (uniqueVariables.length > 0) {
        console.log('Referenced variables found:', uniqueVariables);
      } else {
        console.log('No referenced variables found');
      }

      return uniqueVariables;
    } catch (error) {
      // Invalid JSON, cannot parse for referenced variables
      console.log('Invalid JSON, cannot parse for referenced variables');
      return [];
    }
  }

  /**
   * Called when operation value changes
   * Updates the operationVariables array based on found variables
   * @param buttonIndex - Index of the button being updated
   */
  onOperationValueChange(buttonIndex: number): void {
    const button = this.config.buttons?.[buttonIndex];
    if (!button) return;

    const operationValue = button.operationValue;
    if (!operationValue) return;

    console.log(`Operation value changed for button ${buttonIndex + 1}:`, operationValue);

    const foundVariables = this.parseReferencedVariables(operationValue);

    // Initialize operationVariables if not exists
    if (!button.operationVariables) {
      button.operationVariables = [];
    }

    // Get existing variable labels to preserve their defaults
    const existingVariablesMap = new Map<string, IOperationVariable>();
    button.operationVariables.forEach(v => {
      existingVariablesMap.set(v.label, v);
    });

    // Update operationVariables array
    button.operationVariables = foundVariables.map(varName => {
      // If variable already exists, keep its default value
      if (existingVariablesMap.has(varName)) {
        return existingVariablesMap.get(varName)!;
      }
      const label = this.humanizePipe.transform(varName);
      // Otherwise create new variable with empty default
      return {
        label,
        varName,
        default: ''
      };
    });
  }
}