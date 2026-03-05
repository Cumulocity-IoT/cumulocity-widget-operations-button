import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  Output,
} from '@angular/core';
import { IOperationButtonConfig } from '../models/operation-widget-model';
import { BsModalService } from 'ngx-bootstrap/modal';
import { firstValueFrom } from 'rxjs';
import { CommonModule, NgClass } from '@angular/common';
import { IconDirective } from '@c8y/ngx-components';
import { ConfirmationModalComponent } from './confirmation-modal.component';

@Component({
  selector: 'app-operation-button',
  templateUrl: './operation-button.component.html',
  standalone: true,
  imports: [CommonModule, NgClass, IconDirective]
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

  constructor(private modalService: BsModalService) {}

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

  private updateClasses(): void {}

  async openModal(): Promise<void> {
    if (!this.config.requireConfirmationOperation) {
      this.clickedOperation.emit(this.config);
    } else {
      const initialState = {
        title: this.config.buttonTitle,
        message: this.config.confirmationText || 'Confirm to send this operation'
      };
      const modalRef = this.modalService.show(ConfirmationModalComponent, { initialState });
      if (!modalRef.content) return;
      const result = await firstValueFrom(modalRef.content.closeSubject);
      if (result) {
        this.clickedOperation.emit(this.config);
      }
    }
  }
}
