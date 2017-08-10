import { InputContext } from './struct/input-context.interface';
export declare class InputContextService implements InputContext {
    previousConformedValue: string;
    previousPlaceholder: string;
    currentCaretPosition: number;
    conformedValue: string;
    rawValue: string;
    placeholderChar: string;
    placeholder: string;
    indexesOfPipedChars: any[];
    caretTrapIndexes: any[];
    setSelection(input: HTMLInputElement): void;
}
