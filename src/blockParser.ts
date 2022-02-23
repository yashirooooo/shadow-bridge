import { ApiPromise } from '@polkadot/api';
import { EventRecord } from '@polkadot/types/interfaces';
import { destId, sectionMethod } from './env';
import BridgeLog from './log';

export const bridgeTxPool: any[] = [];

const blockWithEvent = async (api: ApiPromise, bn: number) => {

    const bhash = await api.rpc.chain.getBlockHash(bn);
    return Promise
      .all([
        api.query.system.events.at(bhash),
        // api.rpc.chain.getBlock(bhash),
    ])
}

export async function handleBlock(api: ApiPromise, bn: number) {
    BridgeLog.debug(`Handle finalized number ${bn}`)
    const [events] = await blockWithEvent(api, bn);
    const resEvents: EventRecord[] = events;
    for (const event of resEvents) {
        const eventMethod = `${event.event.section}.${event.event.method}`;
        if (sectionMethod == eventMethod) {
            const dest_id = event.event.data[0]
            if (dest_id.toHuman() == destId) {
                // const _nonce = event.event.data[1]
                // const _resource_id = event.event.data[2]
                const amount = event.event.data[3]
                const recipient = event.event.data[4]
                BridgeLog.info(`Block: ${bn}, recipient: ${recipient.toHuman()?.toString()}, amount: ${amount.toString()}`)
            }
        }
    }
}
