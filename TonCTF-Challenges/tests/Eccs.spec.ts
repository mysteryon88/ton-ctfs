import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { Eccs } from '../wrappers/wrappers/Eccs';
import '@ton/test-utils';

// npx blueprint test Eccs.spec.ts
describe('Eccs', () => {
    let blockchain: Blockchain;

    let level: SandboxContract<Eccs>;

    let player: SandboxContract<TreasuryContract>;

    beforeAll(async () => {
        blockchain = await Blockchain.create();
        player = await blockchain.treasury('player');

        level = blockchain.openContract(await Eccs.fromInit(0n));

        await level.send(
            player.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            },
        );
    });

    it('Exploit', async () => {
        expect(await level.getIsSolved()).toEqual(false);

        const key = 0n;

        const check = await level.getCheck(key);
        expect(check.x).toEqual(456557409365020317n);
        expect(check.y).toEqual(354112687690635257n);

        await level.send(
            player.getSender(),
            {
                value: toNano('0.5'),
            },
            {
                $$type: 'Key',
                k: key,
            },
        );

        expect(await level.getIsSolved()).toEqual(true);
    });
});
