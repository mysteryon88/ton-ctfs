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

export type DaoConfig = {
    global_votes: Dictionary<bigint, bigint>;
    proposals: Dictionary<bigint, bigint>;
    total_votes: bigint;
};

export const value = {
    serialize: (src: bigint, buidler: Builder) => {
        buidler.storeCoins(src);
    },
    parse: (src: Slice) => {
        return src.loadCoins();
    },
};

export function daoConfigToCell(config: DaoConfig): Cell {
    return beginCell()
        .storeDict(config.global_votes)
        .storeDict(config.proposals)
        .storeUint(config.total_votes, 256)
        .endCell();
}

export class Dao implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell },
    ) {}

    static createFromAddress(address: Address) {
        return new Dao(address);
    }

    static createFromConfig(config: DaoConfig, code: Cell, workchain = 0) {
        const data = daoConfigToCell(config);
        const init = { code, data };
        return new Dao(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(0x01, 32).storeUint(0x00, 64).endCell(),
        });
    }

    async sendMoveVotes(provider: ContractProvider, via: Sender, value: bigint, to: Address, amount: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x63a893dd, 32)
                .storeUint(0x00, 64)
                .storeAddress(to)
                .storeInt(amount, 256)
                .endCell(),
        });
    }

    async sendAddOrder(provider: ContractProvider, via: Sender, value: bigint, message: Cell) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(0x187abeff, 32).storeUint(0x00, 64).storeRef(message).endCell(),
        });
    }

    async getTotalVotes(provider: ContractProvider) {
        const result = await provider.get('get_total_votes', []);
        return result.stack.readBigNumber();
    }
}
