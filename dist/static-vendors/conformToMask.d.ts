export default function conformToMask(rawValue?: string, mask?: any, config?: {}): {
    conformedValue: string;
    meta: {
        someCharsRejected: boolean;
    };
};
