import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts/10. BruteforceLevel.tact',
    options: {
        debug: true,
    },
};
