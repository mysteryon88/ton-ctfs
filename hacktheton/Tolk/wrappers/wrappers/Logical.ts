import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type LogicalConfig = {};

export function logicalConfigToCell(config: LogicalConfig): Cell {
    return beginCell().endCell();
}

export const Opcodes = {
    OP_UNLOCK: 0xf0fd50bb,
};

export class Logical implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell },
    ) {}

    static createFromAddress(address: Address) {
        return new Logical(address);
    }

    static createFromConfig(config: LogicalConfig, code: Cell, workchain = 0) {
        const data = logicalConfigToCell(config);
        const init = { code, data };
        return new Logical(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async getLocked(provider: ContractProvider) {
        const result = await provider.get('locked', []);
        return result.stack.readBoolean();
    }

    async getPrevLogicalTime(provider: ContractProvider) {
        const result = await provider.get('prevLogicalTime', []);
        return result.stack.readBigNumber();
    }

    async getLogicalTimeDiff(provider: ContractProvider) {
        const result = await provider.get('logicalTimeDiff', []);
        return result.stack.readBigNumber();
    }
}

export class LogicalExploit implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell },
    ) {}

    static createFromAddress(address: Address) {
        return new LogicalExploit(address);
    }

    static createFromConfig(config: LogicalConfig, code: Cell, workchain = 0) {
        const data = logicalConfigToCell(config);
        const init = { code, data };
        return new LogicalExploit(contractAddress(workchain, init), init);
    }

    async sendExploit(provider: ContractProvider, via: Sender, value: bigint, target: Address) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeAddress(target).endCell(),
        });
    }
}
