import {
    Blockchain,
    RemoteBlockchainStorage,
    SandboxContract,
    TreasuryContract,
    wrapTonClient4ForRemote,
} from '@ton/sandbox';
import { Address, toNano } from '@ton/core';
import { PeekLevel } from '../wrappers/wrappers/PeekLevel';
import '@ton/test-utils';
import { TonClient4 } from '@ton/ton';

// npx blueprint test 6. PeekLevel.spec.ts
describe('PeekLevel', () => {
    let blockchain: Blockchain;

    let level: SandboxContract<PeekLevel>;

    let player: SandboxContract<TreasuryContract>;
    let owner: SandboxContract<TreasuryContract>;

    beforeAll(async () => {
        blockchain = await Blockchain.create({
            storage: new RemoteBlockchainStorage(
                wrapTonClient4ForRemote(
                    new TonClient4({
                        endpoint: 'https://sandbox-v4.tonhubapi.com',
                    }),
                ),
            ),
        });
        player = await blockchain.treasury('player');
        owner = await blockchain.treasury('owner');

        level = blockchain.openContract(
            PeekLevel.fromAddress(Address.parse('EQDFjYOsjvi09ubynowfXevoJJ2k3Wlr8t_2ssDh7i0SCs3U')),
        );
    });

    it('Exploit', async () => {
        // expect(await level.getLocked()).toEqual(true);

        // await contract.send(player, {value: toNano('0.05')}, { $$type: 'Unlock', password: 720069051n})
        await level.send(player.getSender(), { value: toNano('0.1') }, { $$type: 'Unlock', password: 720069051n });

        expect(await level.getLocked()).toEqual(false);
    });
});
