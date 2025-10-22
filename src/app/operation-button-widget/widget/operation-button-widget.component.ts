import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { OperationService } from '@c8y/client';
import { AlertService, CommonModule, CoreModule, FormsModule } from '@c8y/ngx-components';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import {
  IOperationButtonConfig,
  IOperationButtonWidgetConfig,
  IOperationVariable,
} from '../models/IOperationButtonWidgetConfig';
import { ButtonInstanceComponent } from '../button-instance/button-instance.component';

@Component({
  selector: 'app-operation-button-widget',
  templateUrl: './operation-button-widget.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, CoreModule, CollapseModule, ButtonInstanceComponent]
})
export class OperationButtonWidgetComponent implements OnInit, OnChanges {
  @Input() config: IOperationButtonWidgetConfig = {};

  // Track variable values and expanded state separately
  variableValues: Map<number, { [key: string]: string }> = new Map();
  expandedStates: Map<number, boolean> = new Map();

  constructor(
    private operationsService: OperationService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.initializeVariables();
  }

  ngOnChanges(): void {
    this.initializeVariables();
  }

  /**
   * Parse operation value and extract referenced variables
   * @param operationValue - The JSON string to parse
   * @returns Array of variable names found
   */
  private parseReferencedVariables(operationValue: string): string[] {
    try {
      // Check if it's valid JSON first
      JSON.parse(operationValue);

      // Regular expression to match ${variableName} pattern
      const variableRegex = /\$\{([^}]+)\}/g;
      const variables: string[] = [];
      let match: RegExpExecArray | null;

      // Extract all matches from the original string
      while ((match = variableRegex.exec(operationValue)) !== null) {
        // Clean up the variable name - trim whitespace
        const variableName = match[1].trim();
        variables.push(variableName);
      }

      // Remove duplicates
      const uniqueVariables = [...new Set(variables)];

      return uniqueVariables;
    } catch (error) {
      // Invalid JSON, don't parse for variables
      console.log('Invalid JSON, cannot parse for referenced variables');
      return [];
    }
  }

  /**
   * Initialize variable values with defaults
   * If operationVariables is not set in config, parse operationValue to find them
   */
  /**
   * Initialize variable values with defaults
   * If operationVariables is not set in config, parse operationValue to find them
   */
  private initializeVariables(): void {
    if (this.config.buttons) {
      this.config.buttons.forEach((button, index) => {
        // Parse variables from operationValue if not already set
        if (!button.operationVariables || button.operationVariables.length === 0) {
          const foundVariables = this.parseReferencedVariables(button.operationValue);
          if (foundVariables.length > 0) {
            // Create operationVariables array from parsed variables
            button.operationVariables = foundVariables.map(varName => ({
              varName: varName,
              label: varName,
              default: ''
            }));
          }
        }

        // Initialize variable values
        if (!this.variableValues.has(index)) {
          const values: { [key: string]: string } = {};
          if (button.operationVariables) {
            button.operationVariables.forEach(variable => {
              values[variable.varName] = variable.default || '';
            });
          }
          this.variableValues.set(index, values);
          this.expandedStates.set(index, false);
        }
      });
    }
  }


  /**
   * Check if button has variables that need input
   */
  hasVariables(button: IOperationButtonConfig): boolean {
    return !!(button.operationVariables && button.operationVariables.length > 0);
  }

  /**
   * Toggle the collapsed state of variables section
   */
  toggleVariables(index: number): void {
    const currentState = this.expandedStates.get(index) || false;
    this.expandedStates.set(index, !currentState);
  }

  /**
   * Check if variables section is expanded
   */
  isExpanded(index: number): boolean {
    return this.expandedStates.get(index) || false;
  }

  /**
   * Get variable values for a button
   */
  getVariableValues(index: number): { [key: string]: string } {
    return this.variableValues.get(index) || {};
  }

  /**
   * Replace variables in operation value with actual values
   */
  private replaceVariables(operationValue: string, variableValues: { [key: string]: string }): string {
    let result = operationValue;

    // Replace each ${variableName} with its value
    Object.keys(variableValues).forEach(varName => {
      const regex = new RegExp(`\\$\\{${varName}\\}`, 'g');
      const value = variableValues[varName];
      result = result.replace(regex, value);
    });

    console.log('Original operation value:', operationValue);
    console.log('Variable values:', variableValues);
    console.log('After replacement:', result);

    return result;
  }

  /**
   * Validate that all required variables have values
   */
  private validateVariables(button: IOperationButtonConfig, buttonIndex: number): boolean {
    if (!button.operationVariables || button.operationVariables.length === 0) {
      return true;
    }

    const values = this.variableValues.get(buttonIndex) || {};
    const missingVariables = button.operationVariables.filter(variable => {
      const value = values[variable.varName];
      return !value || value.trim() === '';
    });

    if (missingVariables.length > 0) {
      const varNames = missingVariables.map(v => v.label).join(', ');
      this.alertService.warning(
        `Please provide values for the following variables: ${varNames}`
      );
      return false;
    }

    return true;
  }

  onButtonClick(button: IOperationButtonConfig, buttonIndex: number): void {
    console.log('Button clicked:', button.label, 'index:', buttonIndex);

    // Validate variables before proceeding
    if (!this.validateVariables(button, buttonIndex)) {
      return;
    }

    if (this.config.device && this.config.device.id) {
      try {
        // Replace variables in operation value
        let operationValue = button.operationValue;
        const varValues = this.variableValues.get(buttonIndex);

        if (varValues && Object.keys(varValues).length > 0) {
          operationValue = this.replaceVariables(operationValue, varValues);
        }

        // Parse the operation value
        const parsedOperationValue = JSON.parse(operationValue);

        console.log('Creating operation:', {
          deviceId: this.config.device.id,
          description: button.description || button.label,
          [button.operationFragment]: parsedOperationValue,
        });

        // Create the operation
        this.operationsService
          .create({
            deviceId: this.config.device.id,
            description: button.description || button.label,
            [button.operationFragment]: parsedOperationValue,
          })
          .then(() => {
            this.alertService.success(
              `Operation '${button.label}' successfully created.`
            );
          })
          .catch((error) => {
            console.error('Operation creation failed:', error);
            this.alertService.danger(
              `Failed to create '${button.label}' operation.`
            );
          });
      } catch (error) {
        console.error('Failed to parse operation value:', error);
        this.alertService.danger(
          `Invalid operation value for '${button.label}'. Please check the configuration.`
        );
      }
    } else {
      this.alertService.danger(
        `No target device configured for this widget. Unable to create operation.`
      );
    }
  }
}