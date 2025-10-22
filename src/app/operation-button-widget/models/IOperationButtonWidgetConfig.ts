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
  customOperation?: boolean;
  operationVariables?: IOperationVariable[];
  buttonType?: string;
  buttonSize?: string;
  description: string;
  operationValue: string;
  showModal: boolean;
  modalText?: string;
}

export interface IOperationVariable {
  label: string;
  varName: string;
  default?: string;
}
