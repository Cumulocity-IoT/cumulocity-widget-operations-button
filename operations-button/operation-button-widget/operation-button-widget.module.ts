import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CoreModule, HOOK_COMPONENTS } from '@c8y/ngx-components';
import { ButtonInstanceComponent } from './button-instance/button-instance.component';
import { OperationButtonWidgetConfigComponent } from './widget-config/operation-button-widget-config.component';
import { OperationButtonWidgetComponent } from './widget/operation-button-widget.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { OperationValueComponent } from './widget-config/operationValue/operation-value.component';

@NgModule({
  imports: [CommonModule, CoreModule, BsDropdownModule],
  declarations: [
    OperationButtonWidgetComponent,
    OperationButtonWidgetConfigComponent,
    ButtonInstanceComponent,
    OperationValueComponent,
  ],
  entryComponents: [
    OperationButtonWidgetComponent,
    OperationButtonWidgetConfigComponent,
  ],
  providers: [
    {
      provide: HOOK_COMPONENTS,
      multi: true,
      useValue: {
        previewImage: require('./preview.png'),
        id: 'operation-button-widget',
        label: 'Operation Button Widget',
        description: '',
        component: OperationButtonWidgetComponent,
        configComponent: OperationButtonWidgetConfigComponent,
        data: {
          settings: {
            noNewWidgets: false,
            ng1: {
              options: {
                // noDeviceTarget: true,
                groupsSelectable: false,
              },
            },
          },
        },
      },
    },
  ],
})
export class OperationButtonWidgetModule {}
