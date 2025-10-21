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
  buttonType?: string;
  buttonSize?: string;
  description: string;
  operationValue: string;
  showModal: boolean;
  modalText?: string;
  customOperation?: boolean;
}
