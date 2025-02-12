import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { Curve } from '../wrappers/wrappers/Curve';
import '@ton/test-utils';

jest.setTimeout(0);

// npx blueprint test Curve.spec.ts
describe('Curve', () => {
    let blockchain: Blockchain;

    let level: SandboxContract<Curve>;

    let player: SandboxContract<TreasuryContract>;
    let owner: SandboxContract<TreasuryContract>;

    beforeAll(async () => {
        blockchain = await Blockchain.create();
        player = await blockchain.treasury('player');
        owner = await blockchain.treasury('owner');

        level = blockchain.openContract(await Curve.fromInit(0n));
    });

    it('Exploit', async () => {});
});
