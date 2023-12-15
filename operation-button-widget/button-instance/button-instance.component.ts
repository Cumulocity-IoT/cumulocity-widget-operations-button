import {
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import { IOperationButtonConfig } from '../models/IOperationButtonWidgetConfig';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
@Component({
  selector: 'app-button-instance',
  templateUrl: './button-instance.component.html',
})
export class ButtonInstanceComponent {
  @Input() config: IOperationButtonConfig;
  @Output() clickedOperation = new EventEmitter<IOperationButtonConfig>();
  modalRef?: BsModalRef;
  constructor(private modalService: BsModalService) {}
  createOperation(event: Event): void {
    event.stopPropagation();
    this.clickedOperation.emit(this.config);
  }

  openModal(template: TemplateRef<any>, size: 'modal-lg'): void {
    if (!this.config.showModal) {
      this.clickedOperation.emit(this.config);
    } else {
      this.modalRef = this.modalService.show(template, { class: size });
    }
  }
}
