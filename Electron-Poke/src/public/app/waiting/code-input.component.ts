import {
    Component, OnInit, DoCheck, Input, Output, EventEmitter
} from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'code-input',
    templateUrl: 'code-input.html'
})
export class CodeInputComponent implements OnInit, DoCheck {

    /**
     * Passed in on the component.
     */
    @Input() passwordLength: number;

    /**
     * This is used to set the password in the parent control 
     * when we click the submit button. This needs to be created
     * either here or in the constructor. ngOnInit is too late.
     */
    @Output() finalPassword = new EventEmitter<string>();

    /**
     * Will disable the submit button until all text boxes have
     * been filled.
     */
    submitDisabled: boolean;

    /**
     * We need to do an *ngFor in the html and we want to do
     * an input * the number that is specified in passwordLength.
     * This allows the control to be dynamic.
     */
    indexes: number[];

    /**
     * This is the list of characters for the password. It needs
     * to be manually managed because we prevent default on the
     * text boxes.
     */
    private _passwordArray: string[];

    constructor() {
    }

    public async ngOnInit() {
        this.submitDisabled = true;
        this.indexes = Array(this.passwordLength).fill(0).map((x, i) => i);
        this._passwordArray = Array(this.passwordLength).fill(0).map((x, i) => '');
    }

    /**
     * Disables and enables the submit button.
     */
    public async ngDoCheck() {
        for (let i = 0; i < this._passwordArray.length; i++) {
            if (!this._passwordArray[i]) {
                this.submitDisabled = true;
                return;
            }
        }
        this.submitDisabled = false;
    }

    /**
     * We find the src and previous sibling...
     * If the previous sibling exists check if they have a value.
     * If they don't and the current textbox doesn't have a value
     * then we should navigate back to it. Basically this allows
     * us to select the first of the text boxes even if we click 
     * into the 5th.
     * 
     * If we are still in the function after the first check then 
     * we didn't focus on another element. This means we can select 
     * the text of our current element. This makes it easier to 
     * understand what letters you are replacing when it is done.
     */
    public onFocus(event: any) {
        let src = event.srcElement;
        let element = src.previousElementSibling;
        if (element) {
            if (!element.value && !src.value) {
                element.focus();
                return;
            }
        }

        if (src.value) {
            src.select();
        }
    }

    /**
     * No pasting!
     */
    public onPaste(event: any) {
        event.preventDefault();
    }

    /**
     * Handle the key presses ourself.
     */
    public onKeyPress(event: any, index: number) {
        // Immediately prevent default because
        // we don't need it putting in characters 
        // for us.
        event.preventDefault();

        // We must match a number or letter.
        const pattern = /[0-9A-Z]/;
        let inputChar = String.fromCharCode(event.charCode).toUpperCase();

        if (!pattern.test(inputChar) && event.charCode != '0') {
            // If the character doesn't match the pattern
            // go ahead and stop processing. We won't be
            // doing anything.
            return;
        } else {
            // Always make sure the character is uppercase.
            event.currentTarget.value = inputChar;
            this._passwordArray[index] = inputChar;
        }

        // Then we check if we have another sibling ahead of us
        // and if we do we will automatically move over so it
        // can be processed.
        let element = event.srcElement.nextElementSibling;
        if (element) {
            element.focus();
        }
    }

    /**
     * Handles the backspace character.
     * You can even press the backspace from the button
     * that would submit the data. This allows a person
     * to mess up on the last character, but still clear
     * their last character without having to use the mouse.
     */
    public onBackspace(event: any, index: number) {
        // Clear the current spot before we leave.
        // If we do have to clear it, then we prevent default
        // so that after we focus to the previous element it
        // does not clear it as well. It will only clear the
        // previous element if the current element was empty
        // to begin with.
        let src = event.srcElement;
        if (src.value) {
            this._passwordArray[index] = '';
            src.value = '';
            event.preventDefault();
        }

        // Then we check if we have another sibling behind us
        // and if we do we will automatically move over so it
        // can be deleted next!
        let element = event.srcElement.previousElementSibling;
        if (element) {
            // We need to clear out the value we store for this
            // since we are leaving and won't know the index.
            if (index > 0) {
                this._passwordArray[index - 1] = '';
            }
            element.focus();
        }
    }

    /**
     * On finish we should bind to an ng-model so the component
     * outside of this component can have access to the finished
     * value.
     */
    public finish(): void {
        let code = '';
        for (let i = 0; i < this._passwordArray.length; i++) {
            code += this._passwordArray[i];
        }

        // Only if the code is valid can we emit it.
        if (code.length === this.passwordLength) {
            this.finalPassword.emit(code);
        }
    }
}