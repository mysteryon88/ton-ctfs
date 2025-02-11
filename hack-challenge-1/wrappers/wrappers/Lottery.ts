import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type LotteryConfig = {};

export function impureConfigToCell(config: LotteryConfig): Cell {
    return beginCell().endCell();
}

export class Lottery implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell },
    ) {}

    static createFromAddress(address: Address) {
        return new Lottery(address);
    }

    static createFromConfig(config: LotteryConfig, code: Cell, workchain = 0) {
        const data = impureConfigToCell(config);
        const init = { code, data };
        return new Lottery(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: Cell.EMPTY,
        });
    }

    async getBalance(provider: ContractProvider) {
        const result = await provider.get('balance', []);
        return result.stack.readBigNumber();
    }
}
