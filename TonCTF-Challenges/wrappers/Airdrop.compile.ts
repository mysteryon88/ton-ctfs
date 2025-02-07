import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts/Airdrop.tact',
    options: {
        debug: true,
    },
};
