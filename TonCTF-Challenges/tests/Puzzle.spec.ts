import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { Puzzle } from '../wrappers/wrappers/Puzzle';
import '@ton/test-utils';

// npx blueprint test Puzzle.spec.ts
describe('Puzzle', () => {
    let blockchain: Blockchain;

    let level: SandboxContract<Puzzle>;
    let player: SandboxContract<TreasuryContract>;

    beforeAll(async () => {
        blockchain = await Blockchain.create();
        player = await blockchain.treasury('player');

        level = blockchain.openContract(await Puzzle.fromInit(0n));

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
        // Solved with fuzzing
        expect(await level.getIsSolved()).toEqual(false);
        await level.send(
            player.getSender(),
            {
                value: toNano('0.05'),
            },
            'Opeorate3',
        );

        await level.send(
            player.getSender(),
            {
                value: toNano('0.05'),
            },
            'Opeorate2',
        );

        await level.send(
            player.getSender(),
            {
                value: toNano('0.05'),
            },
            'Opeorate7',
        );

        await level.send(
            player.getSender(),
            {
                value: toNano('0.05'),
            },
            'Opeorate1',
        );

        await level.send(
            player.getSender(),
            {
                value: toNano('0.05'),
            },
            'Opeorate4',
        );

        await level.send(
            player.getSender(),
            {
                value: toNano('0.05'),
            },
            'Opeorate3',
        );

        await level.send(
            player.getSender(),
            {
                value: toNano('0.05'),
            },
            'Opeorate4',
        );

        await level.send(
            player.getSender(),
            {
                value: toNano('0.05'),
            },
            'Opeorate2',
        );

        await level.send(
            player.getSender(),
            {
                value: toNano('0.05'),
            },
            'Opeorate2',
        );

        await level.send(
            player.getSender(),
            {
                value: toNano('0.05'),
            },
            'Opeorate4',
        );

        await level.send(
            player.getSender(),
            {
                value: toNano('0.05'),
            },
            'Opeorate2',
        );

        await level.send(
            player.getSender(),
            {
                value: toNano('0.05'),
            },
            'Opeorate7',
        );

        await level.send(
            player.getSender(),
            {
                value: toNano('0.05'),
            },
            'Opeorate3',
        );

        await level.send(
            player.getSender(),
            {
                value: toNano('0.05'),
            },
            'Check',
        );

        expect(await level.getIsSolved()).toEqual(true);
    });
});
