import { ElementRef, AfterViewInit } from '@angular/core';
import { ControlValueAccessor, FormControl } from '@angular/forms';
import { FormatterParserService } from './formatter-parser.service';
import { InputContextService } from './input-context.service';
import { IFormatterParserConfig } from './struct/formatter-parser-config';
export declare class FormatterParserDirective implements ControlValueAccessor, AfterViewInit {
    private _elementRef;
    private fps;
    private inputContext;
    formatterParser: IFormatterParserConfig;
    formControlName: string;
    protected formControl: FormControl;
    protected inputElement: HTMLInputElement;
    private formatterParserView;
    private formatterParserModel;
    private onTouch;
    private onModelChange;
    constructor(_elementRef: ElementRef, fps: FormatterParserService, inputContext: InputContextService);
    registerOnTouched(fn: any): void;
    registerOnChange(fn: any): void;
    ngAfterViewInit(): void;
    onControlInput($event: KeyboardEvent): void;
    writeValue(rawValue: any): void;
    updateFormatterAndParser(): void;
    private getInputElementRef();
}
