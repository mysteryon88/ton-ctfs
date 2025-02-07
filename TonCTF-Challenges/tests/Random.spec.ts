import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { Random } from '../wrappers/wrappers/Random';
import { ExploitRandom } from '../wrappers/wrappers/ExploitRandom';
import '@ton/test-utils';

// npx blueprint test Random.spec.ts
describe('Random', () => {
    let blockchain: Blockchain;

    let level: SandboxContract<Random>;
    let exploit: SandboxContract<ExploitRandom>;

    let player: SandboxContract<TreasuryContract>;
    let owner: SandboxContract<TreasuryContract>;

    beforeAll(async () => {
        blockchain = await Blockchain.create();
        player = await blockchain.treasury('player');
        owner = await blockchain.treasury('owner');

        level = blockchain.openContract(await Random.fromInit(0n));
        exploit = blockchain.openContract(await ExploitRandom.fromInit(level.address));

        const deployResult = await level.send(
            owner.getSender(),
            {
                value: toNano('0.05'),
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
        await exploit.send(
            player.getSender(),
            {
                value: toNano('0.05'),
            },
            'Exploit',
        );

        expect(await level.getIsSolved()).toEqual(true);
    });
});
