import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { ScannerLevel } from '../wrappers/wrappers/ScannerLevel';
import { Child } from '../wrappers/wrappers/Child';
import '@ton/test-utils';

describe('ScannerLevel', () => {
    let blockchain: Blockchain;

    let level: SandboxContract<ScannerLevel>;
    let child: SandboxContract<Child>;

    let player: SandboxContract<TreasuryContract>;
    let owner: SandboxContract<TreasuryContract>;

    beforeAll(async () => {
        blockchain = await Blockchain.create();
        player = await blockchain.treasury('player');
        owner = await blockchain.treasury('owner');

        level = blockchain.openContract(await ScannerLevel.fromInit(player.address, 0n));
        child = blockchain.openContract(await Child.fromInit(level.address, 0n));

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
            { value: toNano('0.1') },
            { $$type: 'SendChildAddress', address: child.address },
        );

        await level.send(player.getSender(), { value: toNano('0.1') }, 'check');

        expect(await level.getCompleted()).toEqual(true);
    });
});
