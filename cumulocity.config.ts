import type { ConfigurationOptions } from '@c8y/devkit';
import { author, description, license, name, version } from './package.json';

export default {
  runTime: {
    author,
    description,
    version,
    name,
    key: 'c8y-pkg-operation-widget-key',
    contentSecurityPolicy:
      "base-uri 'none'; default-src 'self' 'unsafe-inline' http: https: ws: wss:; connect-src 'self' http: https: ws: wss:;  script-src 'self' *.bugherd.com *.twitter.com *.twimg.com *.aptrinsic.com 'unsafe-inline' 'unsafe-eval' data:; style-src * 'unsafe-inline' blob:; img-src * data: blob:; font-src * data:; frame-src *; worker-src 'self' blob:;",
    dynamicOptionsUrl: true,
    contextPath: 'c8y-pkg-operation-button-widget',
    remotes: {
      [name]: ['OperationButtonWidgetModule']
    },
    package: 'plugin',
    isPackage: true,
    noAppSwitcher: true,
    license,
    exports: [
      {
        name: "Operation Button Widget",
        module: 'OperationButtonWidgetModule',
        path: './src/app/index.ts',
        description: 'Widget to create an operation'
      },
    ]
  },
  buildTime: {
    federation: [
      '@angular/animations',
      '@angular/cdk',
      '@angular/common',
      '@angular/compiler',
      '@angular/core',
      '@angular/forms',
      '@angular/platform-browser',
      '@angular/platform-browser-dynamic',
      '@angular/router',
      '@angular/upgrade',
      '@c8y/client',
      '@c8y/ngx-components',
      'ngx-bootstrap',
      '@ngx-translate/core',
      '@ngx-formly/core'
    ],
    "copy": [
      { "from": "src/assets/operation-button-pr.png", "to": "assets/operation-button-pr.png" }
    ]
  }
} as const satisfies ConfigurationOptions;
