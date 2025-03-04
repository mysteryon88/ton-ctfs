import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts/6. PeekLevel.tact',
    options: {
        debug: true,
    },
};
