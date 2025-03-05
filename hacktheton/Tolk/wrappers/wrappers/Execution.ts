import {
    Address,
    beginCell,
    Cell,
    Contract,
    contractAddress,
    ContractProvider,
    fromNano,
    Sender,
    SendMode,
} from '@ton/core';

export type ExecutionConfig = {};

export function executionConfigToCell(config: ExecutionConfig): Cell {
    return beginCell().endCell();
}

export const Opcodes = {
    OP_UNLOCK: 0xf0fd50bb,
};

export class Execution implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell },
    ) {}

    static createFromAddress(address: Address) {
        return new Execution(address);
    }

    static createFromConfig(config: ExecutionConfig, code: Cell, workchain = 0) {
        const data = executionConfigToCell(config);
        const init = { code, data };
        return new Execution(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendRawBody(provider: ContractProvider, via: Sender, value: bigint, body: Cell) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: body,
        });
    }

    async sendExploit(provider: ContractProvider, via: Sender, value: bigint, target: Address) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeAddress(target).endCell(),
        });
    }

    async getBalance(provider: ContractProvider) {
        const result = await provider.get('balance', []);
        return fromNano(result.stack.readBigNumber());
    }
}
