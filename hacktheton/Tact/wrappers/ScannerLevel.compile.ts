import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts/2. ScannerLevel.tact',
    options: {
        debug: true,
    },
};
