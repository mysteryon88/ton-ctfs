import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts/5. PartialLevel.tact',
    options: {
        debug: true,
        external: true,
    },
};
