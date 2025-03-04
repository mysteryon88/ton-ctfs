import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type ProxyConfig = {
    ctxPlayer: Address;
    ctxNonce: bigint;
    ctxOwner: Address;
    ctxEnabled: bigint;
};

export function proxyConfigToCell(config: ProxyConfig): Cell {
    return beginCell()
        .storeAddress(config.ctxPlayer)
        .storeUint(config.ctxNonce, 32)
        .storeAddress(Address.parseRaw('0:0000000000000000000000000000000000000000000000000000000000000000'))
        .storeInt(-1, 1)
        .endCell();
}

export const Opcodes = {
    OP_SEND: 0,
    OP_ENABLED: 1,
};

export class Proxy implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell },
    ) {}

    static createFromAddress(address: Address) {
        return new Proxy(address);
    }

    static createFromConfig(config: ProxyConfig, code: Cell, workchain = 0) {
        const data = proxyConfigToCell(config);
        const init = { code, data };
        return new Proxy(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendSend(
        provider: ContractProvider,
        via: Sender,
        opts: {
            value: bigint;
            target: Address;
            msgBody: Cell;
        },
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(Opcodes.OP_SEND, 32).storeAddress(opts.target).storeRef(opts.msgBody).endCell(),
        });
    }

    async sendEnabled(
        provider: ContractProvider,
        via: Sender,
        opts: {
            value: bigint;
            enabled: bigint;
        },
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(Opcodes.OP_ENABLED, 32).storeInt(opts.enabled, 1).endCell(),
        });
    }

    async getOwner(provider: ContractProvider) {
        const result = await provider.get('owner', []);
        return result.stack.readAddress();
    }

    async getEnabled(provider: ContractProvider) {
        const result = await provider.get('enabled', []);
        return result.stack.readBoolean();
    }
}
