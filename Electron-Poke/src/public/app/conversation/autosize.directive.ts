import {
    Input, AfterViewInit, ElementRef, HostListener, Directive
} from '@angular/core';

/**
 * https://github.com/stevepapa/ng-autosize/
 * Modified version of the above code. I didn't want infinite growing text boxes
 * and there is no reason to define max height instead of a css style so I did
 * it there instead. Min height Also wasn't needed.
 */
@Directive({
    selector: 'textarea[autosize]'
})
export class Autosize implements AfterViewInit {

    private _el: HTMLTextAreaElement;
    private _clientWidth: number;
    private _ngModel: string;

    // On setting of the ngModel we will be adjusting the height
    // of the box. This is instead of a HostListener on "input".
    @Input('ngModel')
    get ngModel(): string {
        return this._ngModel;
    }
    set ngModel(val: string) {
        this._ngModel = val;
        this.adjust();
    }

    @HostListener('window:resize', ['$event'])
    onResize(event: any): void {
        // Only apply adjustment if element width had changed.
        if (this._el.clientWidth === this._clientWidth) {
            return;
        };
        this._clientWidth = this.element.nativeElement.clientWidth;
        this.adjust();
    }

    // This allows us to not handle the enter key press,
    // but still allow the shift+enter which gives us
    // the new line characters.
    @HostListener('keydown', ['$event'])
    onEnterPressed(event: any): void {
        if (!event.shiftKey && event.keyCode === 13) {
            event.preventDefault();
            return;
        }
        this.adjust();
    }

    constructor(public element: ElementRef) {
        this._el = element.nativeElement;
        this._clientWidth = this._el.clientWidth;
    }

    ngAfterViewInit(): void {
        // Run the first adjustment.
        this.adjust();
    }

    adjust(): void {
        let currentValue = this._ngModel || '';

        // If we have no value then we set it to a short string
        // so that it can resize to the appropriate value. If it
        // is truly empty, setting it auto then back to the scroll
        // height won't have changed anything.
        if (currentValue === '' || currentValue === null) {
            this._el.value = ' ';
        }

        // Rows need to be set to 1 otherwise it won't size
        // appropriately when you modify the line height.
        this._el.rows = 1;
        this._el.style.height = 'auto';
        this._el.style.height = this._el.scrollHeight + 'px';

        // Return the value into text area.
        this._el.value = currentValue;
    }
}