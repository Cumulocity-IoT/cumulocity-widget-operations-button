import { Component, Input, OnChanges, SimpleChange, SimpleChanges } from "@angular/core";

@Component({
    selector: "operation-input",
    templateUrl: "./operation-input.component.html",
})
export class OperationInputComponent {
    value: string;
    isValidJson: boolean;
    checkValidJson(event: Event) {
        try {
            JSON.parse(this.value);
            this.isValidJson = true;
            console.log(this.isValidJson)
        } catch (e) {
            this.isValidJson = false;
            console.log(this.isValidJson)
        }

    }
}