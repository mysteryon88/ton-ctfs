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
    TupleItemInt,
    TupleItemSlice,
} from '@ton/core';

export type BetterBankConfig = {
    total_balance: bigint;
    accounts: Dictionary<bigint, bigint>;
};

export const value = {
    serialize: (src: bigint, buidler: Builder) => {
        buidler.storeCoins(src);
    },
    parse: (src: Slice) => {
        return src.loadCoins();
    },
};

export function betterBankConfigToCell(config: BetterBankConfig): Cell {
    return beginCell().storeCoins(config.total_balance).storeDict(config.accounts).endCell();
}

export class BetterBank implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell },
    ) {}

    static createFromAddress(address: Address) {
        return new BetterBank(address);
    }

    static createFromConfig(config: BetterBankConfig, code: Cell, workchain = 0) {
        const data = betterBankConfigToCell(config);
        const init = { code, data };
        return new BetterBank(contractAddress(workchain, init), init);
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
            body: beginCell().storeUint(0x00, 32).storeUint(0x00, 64).endCell(),
        });
    }

    async sendWithdraw(provider: ContractProvider, via: Sender, value: bigint, withdraw_amount: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(0x01, 32).storeUint(0x00, 64).storeCoins(withdraw_amount).endCell(),
        });
    }

    async getUserBalance(provider: ContractProvider, address: bigint) {
        const addressSlice: TupleItemInt = {
            type: 'int',
            value: address,
        };
        const result = await provider.get('get_user_balance', [addressSlice]);
        return result.stack.readBigNumber();
    }

    async getTotalBalance(provider: ContractProvider) {
        const result = await provider.get('get_total_balance', []);
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
}
