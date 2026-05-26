import { Component, inject, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { IOperationWidgetConfig } from '../models/operation-widget-model';
import { parseReferencedVariables, reconcileOperationVariables } from '../models/operation-variables.util';
import { ICONS } from './icons-constant';
import { ControlContainer, FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { WidgetConfigService } from '@c8y/ngx-components/context-dashboard';
import { AlertService, CoreModule, DynamicComponent, IconDirective } from '@c8y/ngx-components';
import { OperationValueComponent } from './operationValue/operation-value.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { OperationWidgetComponent } from '../widget/operation-widget.component';

@Component({
  selector: 'app-operation-widget-config',
  templateUrl: './operation-widget-config.component.html',
  styleUrls: ['./operation-widget-config.component.css'],
  viewProviders: [{ provide: ControlContainer, useExisting: NgForm }],
  standalone: true,
  imports: [CoreModule, CommonModule, FormsModule, IconDirective, BsDropdownModule, OperationWidgetComponent, OperationValueComponent]
})
export class OperationWidgetConfigComponent implements DynamicComponent, OnInit {

  private readonly alert = inject(AlertService);
  private readonly widgetConfigService = inject(WidgetConfigService);

  @Input() config: IOperationWidgetConfig = {};

  supportedOperations: string[] = [];

  readonly buttonTypes = [
    'btn-default',
    'btn-primary',
    'btn-danger',
    'btn-info',
    'btn-link',
    'btn-clean'
  ];

  readonly buttonSizes = ['btn-lg', 'btn-sm', 'btn-xs'];

  readonly availableIcons: string[] = [...ICONS];

  readonly variableTypes: Array<'text' | 'number'> = ['text', 'number'];

  /** Search term per button index for filtering icons in the dropdown. */
  iconSearchTerms: Record<number, string> = {};

  @ViewChild('sampleWidgetPreview')
  set previewMapSet(template: TemplateRef<any>) {
    this.widgetConfigService.setPreview(template ?? true);
  }

  ngOnInit(): void {
    this.refreshSupportedOperations();

    this.widgetConfigService.addOnBeforeSave(() => {
      const invalid = (this.config.buttons ?? [])
        .map((button, i) => ({ button, i }))
        .filter(({ button }) => button.customOperation && !isValidJson(button.operationValue));

      if (invalid.length > 0) {
        const labels = invalid.map(({ i }) => `Button ${i + 1}`).join(', ');
        this.alert.danger(`Invalid JSON in operation value for: ${labels}. Please fix before saving.`);
        return false;
      }
      return true;
    });
  }

  addNewButton(): void {
    this.config.buttons ??= [];
    this.config.buttons.push({
      buttonIcon: undefined,
      buttonLabel: 'Restart',
      buttonTitle: 'Restart device',
      operationFragment: 'c8y_Restart',
      buttonType: 'btn-default',
      buttonSize: 'btn-default',
      operationValue: '{}',
      requireConfirmationOperation: false,
      confirmationText: 'Confirm device restart',
      customOperation: false,
      operationVariables: []
    });
    this.refreshSupportedOperations();
  }

  removeButton(index: number): void {
    this.config.buttons?.splice(index, 1);
    delete this.iconSearchTerms[index];
  }

  onOperationValueChange(buttonIndex: number): void {
    const button = this.config.buttons?.[buttonIndex];
    if (!button?.operationValue) return;

    const found = parseReferencedVariables(button.operationValue);
    button.operationVariables = reconcileOperationVariables(found, button.operationVariables);
  }

  getFilteredIconsForButton(buttonIndex: number): string[] {
    const term = (this.iconSearchTerms[buttonIndex] ?? '').trim().toLowerCase();
    if (!term) return this.availableIcons;
    return this.availableIcons.filter(icon => icon.toLowerCase().includes(term));
  }

  private refreshSupportedOperations(): void {
    const ops = this.config.device?.['c8y_SupportedOperations'];
    this.supportedOperations = Array.isArray(ops) ? (ops as string[]) : [];
  }
}

function isValidJson(value: string): boolean {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}
