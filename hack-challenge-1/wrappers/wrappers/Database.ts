import {
    Address,
    beginCell,
    Builder,
    Cell,
    Contract,
    contractAddress,
    ContractProvider,
    Dictionary,
    Sender,
    SendMode,
    Slice,
} from '@ton/core';

export type DatabaseConfig = {
    admin_address: Address;
    db: Dictionary<bigint, bigint>;
};

export const value = {
    serialize: (src: bigint, buidler: Builder) => {
        buidler.storeCoins(src);
    },
    parse: (src: Slice) => {
        return src.loadCoins();
    },
};

export function databaseConfigToCell(config: DatabaseConfig): Cell {
    return (
        beginCell()
            // store_std_addr
            .storeUint(4, 3)
            .storeUint(0, 8)
            .storeUint(0, 256)
            // store_std_addr
            .storeAddress(config.admin_address)
            .storeDict(config.db)
            .endCell()
    );
}

export class Database implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell },
    ) {}

    static createFromAddress(address: Address) {
        return new Database(address);
    }

    static createFromConfig(config: DatabaseConfig, code: Cell, workchain = 0) {
        const data = databaseConfigToCell(config);
        const init = { code, data };
        return new Database(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: Cell.EMPTY,
        });
    }

    async sendRegister(provider: ContractProvider, via: Sender, value: bigint, withdrawal_address: Address) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            // body: beginCell().storeUint(0x55e28eea, 32).storeAddress(withdrawal_address).endCell(),
            body: beginCell().storeUint(0x55e28eea, 32).storeUint(0x34, 24).endCell(),
        });
    }

    async sendSetVault(provider: ContractProvider, via: Sender, value: bigint, vault: Address) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(0x40404040, 32).storeAddress(vault).endCell(),
        });
    }
}
