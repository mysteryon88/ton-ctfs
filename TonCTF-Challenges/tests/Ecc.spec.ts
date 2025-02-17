import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { Ecc } from '../wrappers/wrappers/Ecc';
import '@ton/test-utils';

// npx blueprint test Ecc.spec.ts
describe('Ecc', () => {
    let blockchain: Blockchain;

    let level: SandboxContract<Ecc>;

    let player: SandboxContract<TreasuryContract>;

    beforeAll(async () => {
        blockchain = await Blockchain.create();
        player = await blockchain.treasury('player');

        level = blockchain.openContract(await Ecc.fromInit(0n));

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

        const key = 45514416202853n;

        const check = await level.getCheck(key);
        expect(check.x).toEqual(565954914175128n);
        expect(check.y).toEqual(196353530004690n);

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
