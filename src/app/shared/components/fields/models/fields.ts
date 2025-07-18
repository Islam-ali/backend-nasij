import { ValidatorsEnum } from "../enums/validators.enum";

export interface IField {
    labelHeader?:string
    type: string;
    name: string;
    label: string;
    path?: string;
    disabled?: boolean;
    hidden?:boolean;
    initValue?: any;
    validation?: IValidations[];
    options?: IOptionsField;
    class?: string;
    dependsOn?:string
}

export interface IOptionsField {
    optionValue: string;
    optionLabel: string;
    optionList: any[];
    class?:string;
    items?:any[]
}

export interface IValidations {
    errorMessage: string;
    Validator: ValidatorsEnum;
    args?: any;
}