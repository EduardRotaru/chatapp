import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
    selector: '[emoji]'
})
export class EmojiDirective implements OnInit {

    @Input('emoji') emoji!: string;

    constructor(private el: ElementRef) { }

    ngOnInit() {
        this.el.nativeElement.textContent += this.getEmoji(this.emoji);
    }

    getEmoji(uniEmoji: string) {
        let emoji!: string;
        switch (uniEmoji) {
            case '%demon%':
                emoji = '👹';
                break;
            case '%angry%':
                emoji = '🤬';
                break;
            case '%shit%':
                emoji = '💩';
                break;
            case '%clown%':
                emoji = '🤡';
                break;
        }

        return emoji
    }
}