import {
    Address,
    beginCell,
    Builder,
    Cell,
    Contract,
    contractAddress,
    ContractProvider,
    Dictionary,
    DictionaryValue,
    Sender,
    SendMode,
    Slice,
    TupleItemSlice,
} from '@ton/core';

export type BankConfig = {
    dict: Dictionary<bigint, bigint>;
};

export const value = {
    serialize: (src: bigint, buidler: Builder) => {
        buidler.storeCoins(src);
    },
    parse: (src: Slice) => {
        return src.loadCoins();
    },
};

export function bankConfigToCell(config: BankConfig): Cell {
    return beginCell().storeDict(config.dict).endCell();
}

export class Bank implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell },
    ) {}

    static createFromAddress(address: Address) {
        return new Bank(address);
    }

    static createFromConfig(config: BankConfig, code: Cell, workchain = 0) {
        const data = bankConfigToCell(config);
        const init = { code, data };
        return new Bank(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: Cell.EMPTY,
        });
    }

    async sendDeposit(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(0, 32).storeUint(0, 64).endCell(),
        });
    }

    async sendWithdraw(provider: ContractProvider, via: Sender, value: bigint, withdraw_amount: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(1, 32).storeUint(0, 64).storeCoins(withdraw_amount).endCell(),
        });
    }

    async getUserBalance(provider: ContractProvider, userAddress: Address) {
        const addressSlice: TupleItemSlice = {
            type: 'slice',
            cell: beginCell().storeAddress(userAddress).endCell(),
        };
        const result = await provider.get('get_user_balance', [addressSlice]);
        return result.stack.readBigNumber();
    }

    async getParseStdAddr(provider: ContractProvider, userAddress: Address) {
        const addressSlice: TupleItemSlice = {
            type: 'slice',
            cell: beginCell().storeAddress(userAddress).endCell(),
        };
        const result = await provider.get('parseStdAddr', [addressSlice]);
        return result.stack.readBigNumber();
    }

    async getBalance(provider: ContractProvider) {
        const result = await provider.get('balance', []);
        return result.stack.readBigNumber();
    }
}
