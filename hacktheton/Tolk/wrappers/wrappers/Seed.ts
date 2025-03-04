import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type SeedConfig = {};

export function seedConfigToCell(config: SeedConfig): Cell {
    return beginCell().endCell();
}

export const Opcodes = {
    OP_UNLOCK: 0xf0fd50bb,
};

export class Seed implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell },
    ) {}

    static createFromAddress(address: Address) {
        return new Seed(address);
    }

    static createFromConfig(config: SeedConfig, code: Cell, workchain = 0) {
        const data = seedConfigToCell(config);
        const init = { code, data };
        return new Seed(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendUnlock(provider: ContractProvider, via: Sender, value: bigint, guess: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(Opcodes.OP_UNLOCK, 32).storeUint(guess, 256).endCell(),
        });
    }

    async getLocked(provider: ContractProvider) {
        const result = await provider.get('locked', []);
        return result.stack.readBoolean();
    }

    async getSeed(provider: ContractProvider) {
        const result = await provider.get('seed', []);
        return result.stack.readBigNumber();
    }
}

export class SeedExploit implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell },
    ) {}

    static createFromAddress(address: Address) {
        return new SeedExploit(address);
    }

    static createFromConfig(config: SeedConfig, code: Cell, workchain = 0) {
        const data = seedConfigToCell(config);
        const init = { code, data };
        return new SeedExploit(contractAddress(workchain, init), init);
    }

    async sendExploit(provider: ContractProvider, via: Sender, value: bigint, target: Address, seed: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeAddress(target).storeUint(seed, 256).endCell(),
        });
    }
}
