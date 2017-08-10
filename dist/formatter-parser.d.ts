import { IFormatterParserFn } from './struct/formatter-parser-function';
import { IFormatterParserResult } from './struct/formatter-parser-result';
import { IConformToMaskConfig } from './struct/transform-functions/conform-to-mask-config';
export declare class FormatterParser {
    static toUpperCase: IFormatterParserFn;
    static toLowerCase: IFormatterParserFn;
    static toCapitalized: IFormatterParserFn;
    static replaceString(searchValue: RegExp, replaceValue: string): IFormatterParserFn;
    static conformToMask(mask: (string | RegExp)[] | Function, config: IConformToMaskConfig): (value: any) => IFormatterParserResult;
}
