import {
    Blockchain,
    RemoteBlockchainStorage,
    SandboxContract,
    TreasuryContract,
    wrapTonClient4ForRemote,
} from '@ton/sandbox';
import { Address, Cell, toNano } from '@ton/core';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';
import { TonClient4 } from '@ton/ton';
import { Execution } from '../wrappers/wrappers/Execution';

// npx blueprint test 20. Execution.spec.ts
describe('Execution', () => {
    let code: Cell;
    let exploit_code: Cell;

    beforeAll(async () => {
        code = await compile('Execution');
        exploit_code = await compile('ExecutionExploit');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let level: SandboxContract<Execution>;
    let exploit: SandboxContract<Execution>;

    const level_addr = Address.parse('EQAvmO1lAZqvadriRlWxzI-3tF7K0sCMpl_D3NnUyl7s7xc3');
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

        level = blockchain.openContract(Execution.createFromAddress(level_addr));
        exploit = blockchain.openContract(Execution.createFromConfig({}, exploit_code));
    });

    it('Exploit', async () => {
        console.log(await level.getBalance());

        await exploit.sendExploit(deployer.getSender(), toNano('0.1'), level_addr);

        console.log(await level.getBalance());
    });
});
