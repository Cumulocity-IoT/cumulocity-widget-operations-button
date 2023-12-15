import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BootstrapComponent, CommonModule, CoreModule, RouterModule } from '@c8y/ngx-components';
import { CockpitDashboardModule } from '@c8y/ngx-components/context-dashboard';

@NgModule({
  imports: [
    BrowserAnimationsModule,
    RouterModule.forRoot([]),
    CoreModule.forRoot(),
    CockpitDashboardModule,
    CommonModule
  ],
  bootstrap: [BootstrapComponent]
})
export class AppModule {}
