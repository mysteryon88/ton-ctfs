import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { Curve } from '../wrappers/wrappers/Curve';
import '@ton/test-utils';

// npx blueprint test Curve.spec.ts
describe('Curve', () => {
    let blockchain: Blockchain;

    let level: SandboxContract<Curve>;

    let player: SandboxContract<TreasuryContract>;

    beforeAll(async () => {
        blockchain = await Blockchain.create();
        player = await blockchain.treasury('player');

        level = blockchain.openContract(await Curve.fromInit(0n));

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
        // The solution is in the curve.py file
        expect(await level.getIsSolved()).toEqual(false);

        const key = 23019947n;

        const check = await level.getCheck(key);
        expect(check.x).toEqual(1098402780140240490917n);
        expect(check.y).toEqual(1079661110557516547244n);

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
