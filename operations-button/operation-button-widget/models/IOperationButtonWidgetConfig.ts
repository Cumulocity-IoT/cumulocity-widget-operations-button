export interface IOperationButtonWidgetConfig {
  device?: {
    id: string;
    name?: string;
  };
  buttons?: IOperationButtonConfig[];
}

export interface IOperationButtonConfig {
  label: string;
  icon?: string;
  operationFragment: string;
  buttonClasses?: string;
  description: string;
  operationValue: string;
  showModal: boolean;
  modalText?: string;
}
