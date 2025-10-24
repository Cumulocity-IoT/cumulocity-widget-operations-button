import {
  DynamicWidgetDefinition,
  gettext,
  hookWidget} from '@c8y/ngx-components';
import {
  exportConfigWithDevice,
  importConfigWithDevice
} from '@c8y/ngx-components/widgets/import-export-config';
import { assetPaths } from '../assets/assets';
import { OperationButtonComponent } from './operation-button-widget/widget/operation-button.component';
import { OperationButtonConfigComponent } from './operation-button-widget/widget-config/operation-button-config.component';

export const samplePluginWidgetDefinition = {
    id: 'operation-button-widget',
    label: 'Operation Button Widget',
  description: gettext('Widget to create an operation'),
  component: OperationButtonComponent,
  configComponent: OperationButtonConfigComponent,
  previewImage: assetPaths.previewImage,
  data: {
    schema: () =>
      import('c8y-schema-loader?interfaceName=SamplePluginConfig!./sample-plugin.model'),
    export: exportConfigWithDevice,
    import: importConfigWithDevice,
    settings: {
      noNewWidgets: false
    }
  }
} satisfies DynamicWidgetDefinition;

export const OperationButtonWidgetModule = [hookWidget(samplePluginWidgetDefinition)];
