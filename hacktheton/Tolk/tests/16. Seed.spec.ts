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
import { Seed, SeedExploit } from '../wrappers/wrappers/Seed';

// npx blueprint test 16. Seed.spec.ts
describe('Seed', () => {
    let level_code: Cell;
    let exploit_code: Cell;

    beforeAll(async () => {
        level_code = await compile('Seed');
        exploit_code = await compile('SeedExploit');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let level: SandboxContract<Seed>;
    let exploit: SandboxContract<SeedExploit>;

    const level_addr = Address.parse('EQCPLyTcwUjj4bYw-qlaMHgcPgXOVJTugswN5tcqzzQyGFz_');
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

        level = blockchain.openContract(Seed.createFromAddress(level_addr));
    });

    it('Exploit', async () => {
        console.log('Locked', await level.getLocked());

        // await contract.send(
        //     player,
        //     beginCell().storeUint(0xf0fd50bb, 32).storeUint(10n, 256).endCell(),
        //     toNano('0.1'),
        // );
        await level.sendUnlock(deployer.getSender(), toNano('0.5'), 10n);

        exploit = blockchain.openContract(SeedExploit.createFromConfig({}, exploit_code));

        await exploit.sendExploit(deployer.getSender(), toNano('0.5'), level_addr, await level.getSeed());

        expect(await level.getLocked()).toEqual(false);
    });
});
