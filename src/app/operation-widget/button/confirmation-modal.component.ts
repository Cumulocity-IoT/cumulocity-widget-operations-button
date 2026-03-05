import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  ConfirmModalComponent,
  CoreModule,
  ModalLabels,
  Status,
  StatusType
} from '@c8y/ngx-components';
import { gettext } from '@c8y/ngx-components/gettext';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  standalone: true,
  imports: [CoreModule]
})
export class ConfirmationModalComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() title: string;
  @Input() message: string;
  @ViewChild('modalRef', { static: false }) modalRef: ConfirmModalComponent;

  messageTranslated: string;
  closeSubject: Subject<boolean> = new Subject();

  @Input() labels: ModalLabels = {
    ok: gettext('Confirm'),
    cancel: gettext('Cancel')
  };
  status: StatusType = Status.WARNING;

  constructor(private translateService: TranslateService) {}

  ngOnInit() {
    this.messageTranslated = this.translateService.instant(gettext(this.message));
  }

  async ngAfterViewInit() {
    try {
      await this.modalRef.result;
      this.onClose();
    } catch {
      this.onDismiss();
    }
  }

  onClose() {
    this.closeSubject.next(true);
    this.closeSubject.complete();
  }

  onDismiss() {
    this.closeSubject.next(false);
    this.closeSubject.complete();
  }

  ngOnDestroy() {
    this.closeSubject.complete();
  }
}
