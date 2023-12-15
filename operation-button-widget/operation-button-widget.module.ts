import { assetPaths } from '../assets/assets';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CoreModule, hookComponent } from '@c8y/ngx-components';
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
    hookComponent({
      id: 'operation-button-widget',
      label: 'Operation Button Widget',
      description: '',
      component: OperationButtonWidgetComponent,
      configComponent: OperationButtonWidgetConfigComponent,
      previewImage: assetPaths.previewImage,
    })
  ],
})

export class OperationButtonWidgetModule {}
