import { Component, inject, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { IOperationButtonWidgetConfig } from '../models/IOperationButtonWidgetConfig';
import { ICONS } from './icons-constant';
import { ControlContainer, FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OperationButtonWidgetComponent } from '../widget/operation-button-widget.component';
import { WidgetConfigService } from '@c8y/ngx-components/context-dashboard';
import { AlertService, CoreModule, DynamicComponent, IconDirective } from '@c8y/ngx-components';
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
    });

    if (this.config.device && this.config.device['c8y_SupportedOperations']) {
      this.supportedOperations = this.config.device['c8y_SupportedOperations'];
    }
  }

  removeButton(index: number): void {
    this.config.buttons.splice(index, 1);
  }

}
