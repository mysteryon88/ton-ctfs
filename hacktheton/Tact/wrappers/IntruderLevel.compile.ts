import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts/4. IntruderLevel.tact',
    options: {
        debug: true,
    },
};
