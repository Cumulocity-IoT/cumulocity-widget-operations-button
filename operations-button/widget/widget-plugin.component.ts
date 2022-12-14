import { Component, Input } from '@angular/core';

@Component({
  selector: 'c8y-widget-plugin',
  template: `
    <div class="p-16">
      <h1>Widget-plugin</h1>
      <p class="text">{{ config?.text || 'No text' }}</p>
      <small>My context is: {{ config?.device?.name || 'No context' }}</small>
    </div>
  `,
  styles: [
    `
      .text {
        transform: scaleX(-1);
        font-size: 3em;
      }
    `
  ]
})
export class WidgetPluginComponent {
  @Input() config;
}
