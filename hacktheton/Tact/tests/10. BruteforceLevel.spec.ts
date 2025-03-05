import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, toNano } from '@ton/core';
import { BruteforceLevel } from '../wrappers/wrappers/BruteforceLevel';
import '@ton/test-utils';

// npx blueprint test 10. BruteforceLevel.spec.ts
describe('BruteforceLevel', () => {
    let blockchain: Blockchain;

    let level: SandboxContract<BruteforceLevel>;

    let player: SandboxContract<TreasuryContract>;
    let owner: SandboxContract<TreasuryContract>;

    beforeAll(async () => {
        blockchain = await Blockchain.create();
        player = await blockchain.treasury('player');
        owner = await blockchain.treasury('owner');

        level = blockchain.openContract(await BruteforceLevel.fromInit(player.address, 0n));

        const deployResult = await level.send(
            owner.getSender(),
            {
                value: toNano('0.1'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            },
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: owner.address,
            to: level.address,
            deploy: true,
            success: true,
        });
    });

    it('Exploit', async () => {
        // expect(await level.getLocked()).toEqual(true);

        // await contract.send(player, { value: toNano('0.1') }, { $$type: 'Unlock', a: -1199n, b: -849n, c: 1200n, d: 850n });

        const res = await level.send(
            player.getSender(),
            {
                value: toNano('0.05'),
            },
            { $$type: 'Unlock', a: -1199n, b: -849n, c: 1200n, d: 850n },
        );

        console.log(res);

        expect(await level.getLocked()).toEqual(false);
    });
});
