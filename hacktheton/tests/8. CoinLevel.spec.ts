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
import { CoinLevel } from '../wrappers/wrappers/CoinLevel';
import { CoinLevelExploit } from '../wrappers/wrappers/CoinLevelExploit';

// npx blueprint test 8. CoinLevel.spec.ts
describe('CoinLevel', () => {
    let blockchain: Blockchain;

    let level: SandboxContract<CoinLevel>;
    const level_addr = Address.parse('EQA5CLZol6yUtfII5326lC6E6lhQZbhMw-MlUUoVmKudHHf6');

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

        level = blockchain.openContract(CoinLevel.fromAddress(level_addr));
    });

    it('Exploit', async () => {
        const exploit = blockchain.openContract(await CoinLevelExploit.fromInit(level_addr, 0n));

        await exploit.send(player.getSender(), { value: toNano('2') }, 'Exploit');

        console.log('ConsecutiveWins:', await level.getConsecutiveWins());
    });
});
