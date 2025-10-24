import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  Output,
  TemplateRef,
} from '@angular/core';
import { IOperationButtonConfig } from '../models/operation-widget-model';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { CommonModule, NgClass } from '@angular/common';
import { IconDirective } from '@c8y/ngx-components';

@Component({
  selector: 'app-operation-button',
  templateUrl: './operation-button.component.html',
  standalone: true,
  imports: [
    CommonModule, NgClass, IconDirective
  ]
})
export class OperationButtonComponent implements OnInit, OnChanges {
  @Input() config: IOperationButtonConfig = {
    buttonLabel: '',
    operationFragment: '',
    buttonTitle: '',
    buttonType: '',
    operationValue: '',
    requireConfirmationOperation: false
  };
  @Output() clickedOperation = new EventEmitter<IOperationButtonConfig>();
  modalRef?: BsModalRef;


  constructor(private modalService: BsModalService) { }

   get classes(): string {
    return `${this.config?.buttonType || ''} ${this.config?.buttonSize || ''}`.trim();
  }

  ngOnInit(): void {
    this.updateClasses();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config']) {
      this.updateClasses();
    }
  }

  private updateClasses(): void {
    // this.classes = `${this.config?.buttonType || ''} ${this.config?.buttonSize || ''}`.trim();
  }

  createOperation(event: Event): void {
    event.stopPropagation();
    this.clickedOperation.emit(this.config);
  }

  openModal(template: TemplateRef<any>, size: 'modal-lg'): void {
    if (!this.config.requireConfirmationOperation) {
      this.clickedOperation.emit(this.config);
    } else {
      this.modalRef = this.modalService.show(template, { class: size });
    }
  }
}