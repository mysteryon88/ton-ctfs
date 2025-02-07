import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts/Curve.tact',
    options: {
        debug: true,
    },
};
