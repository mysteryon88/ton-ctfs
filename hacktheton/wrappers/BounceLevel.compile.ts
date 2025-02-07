import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts/3. BounceLevel.tact',
    options: {
        debug: true,
    },
};
