export interface IOperationWidgetConfig {
  device?: {
    id: string;
    name?: string;
    [key: string]: unknown;
  };
  buttons?: IOperationButtonConfig[];
}

export interface IOperationButtonConfig {
  buttonLabel: string;
  buttonType?: string;
  buttonSize?: string;
  buttonTitle: string;
  buttonIcon?: string;
  operationFragment: string;
  customOperation?: boolean;
  operationVariables?: IOperationVariable[];
  operationValue: string;
  requireConfirmationOperation: boolean;
  confirmationText?: string;
}

export interface IOperationVariable {
  label: string;
  varName: string;
  default?: string;
  type:  "number" | "text";
}
