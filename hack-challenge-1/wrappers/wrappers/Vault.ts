import {
    Address,
    beginCell,
    Cell,
    Contract,
    contractAddress,
    ContractProvider,
    Sender,
    SendMode,
    TupleItemSlice,
} from '@ton/core';

export type VaultConfig = {
    database_address: Address;
};

export function vaultConfigToCell(config: VaultConfig): Cell {
    return beginCell().storeAddress(config.database_address).endCell();
}

export class Vault implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell },
    ) {}

    static createFromAddress(address: Address) {
        return new Vault(address);
    }

    static createFromConfig(config: VaultConfig, code: Cell, workchain = 0) {
        const data = vaultConfigToCell(config);
        const init = { code, data };
        return new Vault(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(0x00, 32).endCell(),
        });
    }

    async sendCheck(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: 'check',
        });
    }

    async getAddrHash(provider: ContractProvider, userAddress: Address) {
        const addressSlice: TupleItemSlice = {
            type: 'slice',
            cell: beginCell().storeAddress(userAddress).endCell(),
        };
        const result = await provider.get('addr_hash', [addressSlice]);
        return result.stack.readBigNumber();
    }
}
