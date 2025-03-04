import { toNano } from '@ton/core';
import { Tolk } from '../wrappers/Tolk';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const tolk = provider.open(
        Tolk.createFromConfig(
            {
                id: Math.floor(Math.random() * 10000),
                counter: 0,
            },
            await compile('Tolk')
        )
    );

    await tolk.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(tolk.address);

    console.log('ID', await tolk.getID());
}
