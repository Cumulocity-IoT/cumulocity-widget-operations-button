import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetPluginComponent } from './widget-plugin.component';
import { WidgetPluginConfig } from './widget-plugin-config.component';
import { HOOK_COMPONENTS, FormsModule, DynamicComponentDefinition } from '@c8y/ngx-components';

// import for the preview img to get into the build.
let previewImage = '';
try {
  // tslint:disable-next-line: no-var-requires
  previewImage = require('@c8y/style/img/widget-plugin-pr.png');
} catch (ex) {
  // intended empty
}

@NgModule({
  declarations: [WidgetPluginComponent, WidgetPluginConfig],
  entryComponents: [WidgetPluginComponent, WidgetPluginConfig],
  imports: [CommonModule, FormsModule],
  exports: [],
  providers: [
    {
      provide: HOOK_COMPONENTS,
      multi: true,
      useValue: [
        {
          id: 'angular.widget.plugin',
          label: 'Module Federation widget',
          description: 'Widget added via Module Federation',
          component: WidgetPluginComponent,
          previewImage,
          configComponent: WidgetPluginConfig
        }
      ] as DynamicComponentDefinition[]
    }
  ]
})
export class WidgetPluginModule {}
