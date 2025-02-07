import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts/Puzzle.tact',
    options: {
        debug: true,
    },
};
