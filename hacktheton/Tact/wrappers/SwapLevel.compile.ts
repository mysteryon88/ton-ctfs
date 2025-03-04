import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts/7. SwapLevel.tact',
    options: {
        debug: true,
    },
};
