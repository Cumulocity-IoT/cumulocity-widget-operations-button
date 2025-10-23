import { Component, inject, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { IOperationButtonWidgetConfig, IOperationVariable } from '../models/IOperationButtonWidgetConfig';
import { ICONS } from './icons-constant';
import { ControlContainer, FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OperationButtonWidgetComponent } from '../widget/operation-button-widget.component';
import { WidgetConfigService } from '@c8y/ngx-components/context-dashboard';
import { AlertService, CoreModule, DynamicComponent, IconDirective, ForOfFilterPipe } from '@c8y/ngx-components';
import { OperationValueComponent } from './operationValue/operation-value.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { IIdentified, IResultList } from '@c8y/client';
import { pipe } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-operation-button-widget-config',
  templateUrl: './operation-button-widget-config.component.html',
  viewProviders: [{ provide: ControlContainer, useExisting: NgForm }],
  standalone: true,
  imports: [CoreModule, CommonModule, FormsModule, IconDirective, BsDropdownModule, OperationButtonWidgetComponent, OperationValueComponent]
})
export class OperationButtonWidgetConfigComponent implements DynamicComponent, OnInit {

  private readonly alert = inject(AlertService);
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

  // Convert to IResultList format for c8y-typeahead
  iconsList: IResultList<IIdentified>;

  variableTypes: Array<'text' | 'number'> = ['text', 'number'];

  // Filter pipe and pattern for icon search
  iconFilterPipes: Map<number, ForOfFilterPipe> = new Map();
  iconSearchPatterns: Map<number, string> = new Map();

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

    // Convert icons array to IResultList format for typeahead
    const iconsAsIIdentified: IIdentified[] = this.availableIcons.map(icon => ({ 
      id: icon,
      name: icon 
    } as any));
    
    this.iconsList = { 
      data: iconsAsIIdentified, 
      res: undefined 
    } as IResultList<IIdentified>;
  }

  /**
   * Set filter pipe for icon search
   * @param buttonIndex - Index of the button
   * @param filterStr - Search string
   */
  setIconFilterPipe(buttonIndex: number, filterStr: string): void {
    this.iconSearchPatterns.set(buttonIndex, filterStr);
    
    const filterPipe = pipe(
      map((data: any[]) => {
        if (!filterStr || filterStr.trim() === '') {
          return data;
        }
        return data.filter((icon: any) =>
          icon.name && icon.name.toLowerCase().includes(filterStr.toLowerCase())
        );
      })
    );
    
    this.iconFilterPipes.set(buttonIndex, filterPipe);
  }

  /**
   * Get filter pipe for a specific button
   */
  getIconFilterPipe(buttonIndex: number): ForOfFilterPipe {
    return this.iconFilterPipes.get(buttonIndex) || pipe(map(data => data));
  }

  /**
   * Get search pattern for a specific button
   */
  getIconSearchPattern(buttonIndex: number): string {
    return this.iconSearchPatterns.get(buttonIndex) || '';
  }

  addNewButton(): void {
    if (!this.config.buttons) {
      this.config.buttons = [];
    }

    this.config.buttons.push({
      buttonIcon: undefined,
      buttonLabel: 'Restart',
      buttonTitle: 'Restart device',
      operationFragment: 'c8y_Restart',
      buttonType: "btn-default",
      buttonSize: "btn-default",
      operationValue: '{}',
      requireConfirmationOperation: false,
      confirmationText: 'Confirm device restart',
      customOperation: false,
      operationVariables: []
    });

    if (this.config.device && this.config.device['c8y_SupportedOperations']) {
      this.supportedOperations = this.config.device['c8y_SupportedOperations'];
    }
  }

  removeButton(index: number): void {
    this.config.buttons.splice(index, 1);
    // Clean up filter pipes
    this.iconFilterPipes.delete(index);
    this.iconSearchPatterns.delete(index);
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
        // Clean up the variable name - trim whitespace
        const variableName = match[1].trim();
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
      // Invalid JSON, don't parse for variables
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

    // Get existing variable labels to preserve their defaults and types
    const existingVariablesMap = new Map<string, IOperationVariable>();
    button.operationVariables.forEach(v => {
      existingVariablesMap.set(v.varName, v);
    });

    // Update operationVariables array
    button.operationVariables = foundVariables.map(varName => {
      // If variable already exists, keep its settings
      if (existingVariablesMap.has(varName)) {
        return existingVariablesMap.get(varName)!;
      }
      // Otherwise create new variable with empty default and text type
      return {
        varName: varName,
        label: varName,
        default: '',
        type: 'text' as const
      };
    });
  }
}