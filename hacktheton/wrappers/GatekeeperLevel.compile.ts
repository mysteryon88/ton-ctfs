import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts/9. GatekeeperLevel.tact',
    options: {
        debug: true,
    },
};
