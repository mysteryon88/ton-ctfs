import {
    Blockchain,
    RemoteBlockchainStorage,
    SandboxContract,
    TreasuryContract,
    wrapTonClient4ForRemote,
} from '@ton/sandbox';
import { Address, Sender, toNano } from '@ton/core';
import { GatekeeperLevel } from '../wrappers/wrappers/GatekeeperLevel';
import { GatekeeperLevelExploit } from '../wrappers/wrappers/GatekeeperLevelExploit';
import '@ton/test-utils';
import { TonClient4 } from '@ton/ton';

// npx blueprint test 9. GatekeeperLevel.spec.ts
describe('GatekeeperLevel', () => {
    let blockchain: Blockchain;

    let level: SandboxContract<GatekeeperLevel>;
    let exploit: SandboxContract<GatekeeperLevelExploit>;

    let player: Sender;
    let exploiter: SandboxContract<TreasuryContract>;

    const level_addr = Address.parse('EQCpQBUfYlbp3f57cFtQ2VwXTu-imwuh3kf9uc3YcP36bz8C');
    const player_addr = Address.parse('0QCfWnJsn6EObZIpyynLFgEI__C5qX4l_WsiaokAZuDW7bT2');

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

        player = blockchain.sender(player_addr);
        exploiter = await blockchain.treasury('exploiter');

        level = blockchain.openContract(GatekeeperLevel.fromAddress(level_addr));
        exploit = blockchain.openContract(await GatekeeperLevelExploit.fromInit(player.address!, 0n));

        const res = await exploit.send(
            exploiter.getSender(),
            {
                value: toNano('0.1'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            },
        );
    });

    it('Exploit', async () => {
        const xor = await exploit.getXor(player.address!, level_addr);

        const result = findAB(xor);

        if (result) {
            console.log('Найдено решение:');
            console.log('a:', result.a.toString());
            console.log('b:', result.b.toString());
        } else {
            console.log('Решение не найдено.');
        }

        await level.send(player, { value: toNano('0.1') }, { $$type: 'Unlock', a: result!.a, b: result!.b });

        // solution in terminal
        // await contract.send(player, {value: toNano('0.05')},
        //      { $$type: 'Unlock', a: 3852319140205807843758092188865374792187628433049603820081484200324830530303n, b: 5n })

        expect(await level.getLocked()).toEqual(false);
    });

    function findAB(N: bigint): { a: bigint; b: bigint } | null {
        for (let b = 5n; b >= 0n; b--) {
            const a = (N - b) / 4n;
            if (a < 1n << 257n && b < 1n << 257n) {
                return { a, b };
            }
        }
        return null;
    }
});
