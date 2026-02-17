import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { OperationService } from '@c8y/client';
import { AlertService, CommonModule, CoreModule, FormsModule } from '@c8y/ngx-components';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { OperationButtonComponent } from '../button/operation-button.component';
import { IOperationButtonConfig, IOperationWidgetConfig } from '../models/operation-widget-model';

@Component({
  selector: 'app-operation-widget',
  templateUrl: './operation-widget.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, CoreModule, CollapseModule, OperationButtonComponent]
})
export class OperationWidgetComponent implements OnInit, OnChanges {
  @Input() config: IOperationWidgetConfig = {};

  // Track variable values and expanded state separately
  variableValues: Map<number, { [key: string]: string | number }> = new Map();
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
              default: '',
              type: 'text' as const
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
  getVariableValues(index: number): { [key: string]: string | number } {
    return this.variableValues.get(index) || {};
  }

  /**
   * Replace variables in operation value with actual values
   */
  private replaceVariables(operationValue: string, variableValues: { [key: string]: string | number }, button: IOperationButtonConfig): string {
    let result = operationValue;

    // Replace each ${variableName} with its value
    Object.keys(variableValues).forEach(varName => {
      const value = variableValues[varName];

      // Find the variable definition to check its type
      const variableDef = button.operationVariables?.find(v => v.varName === varName);

      // Create regex to match ${variableName} with possible surrounding quotes
      const regexWithQuotes = new RegExp(`"\\$\\{${varName}\\}"`, 'g');
      const regexWithoutQuotes = new RegExp(`\\$\\{${varName}\\}`, 'g');

      // Convert value to appropriate type
      if (variableDef?.type === 'number') {
        // For numbers, replace including the quotes to get raw number in JSON
        result = result.replace(regexWithQuotes, String(value));
        // Also handle case without quotes
        result = result.replace(regexWithoutQuotes, String(value));
      } else {
        // For text, replace the placeholder but keep it as a string
        result = result.replace(regexWithoutQuotes, String(value));
      }
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

      // Check if value is null or undefined
      if (value === null || value === undefined) {
        return true;
      }

      // For string values, check if empty or only whitespace
      if (typeof value === 'string') {
        return value.trim() === '';
      }

      // For number values, check if it's a valid number
      if (variable.type === 'number') {
        // Convert to string first, then check if it's empty or NaN
        const stringValue = String(value).trim();
        return stringValue === '' || isNaN(Number(value));
      }

      // For other types, just check if it's falsy
      return !value;
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
    console.log('Button clicked:', button.buttonLabel, 'index:', buttonIndex);

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
          operationValue = this.replaceVariables(operationValue, varValues, button);
        }

        // Parse the operation value
        const parsedOperationValue = JSON.parse(operationValue);

        console.log('Creating operation:', {
          deviceId: this.config.device.id,
          description: button.buttonTitle || button.buttonLabel,
          [button.operationFragment]: parsedOperationValue,
        });

        // Create the operation
        this.operationsService
          .create({
            deviceId: this.config.device.id,
            description: button.buttonTitle || button.buttonLabel,
            [button.operationFragment]: parsedOperationValue,
          })
          .then(() => {
            this.alertService.success(
              `Operation '${button.buttonLabel}' successfully created.`
            );
          })
          .catch((error) => {
            console.error('Operation creation failed:', error);
            this.alertService.danger(
              `Failed to create '${button.buttonLabel}' operation.`
            );
          });
      } catch (error) {
        console.error('Failed to parse operation value:', error);
        this.alertService.danger(
          `Invalid operation value for '${button.buttonLabel}'. Please check the configuration.`
        );
      }
    } else {
      this.alertService.danger(
        `No target device configured for this widget. Unable to create operation.`
      );
    }
  }
}