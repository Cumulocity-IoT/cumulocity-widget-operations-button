import {
  DynamicWidgetDefinition,
  gettext,
  hookWidget} from '@c8y/ngx-components';
import {
  exportConfigWithDevice,
  importConfigWithDevice
} from '@c8y/ngx-components/widgets/import-export-config';
import { assetPaths } from '../assets/assets';
import { OperationWidgetComponent } from './operation-widget/widget/operation-widget.component';
import { OperationWidgetConfigComponent } from './operation-widget/widget-config/operation-widget-config.component';

export const samplePluginWidgetDefinition = {
    id: 'operation-button-widget',
    label: 'Operation Button Widget',
  description: gettext('Widget to create an operation'),
  component: OperationWidgetComponent,
  configComponent: OperationWidgetConfigComponent,
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
