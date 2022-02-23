import { ApiPromise, Keyring } from '@polkadot/api';
import type { EventRecord } from '@polkadot/types/interfaces';
import { shadowApi } from './api/shadow';
import { consumer } from './bridgeConsumer';
import { destId, sectionMethod } from './env';
const Events = require('events');
export const emitter = new Events();
import BridgeLog from './log';
const keyring = new Keyring();

emitter.on('msg', async () => {
    await consumer()
});

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
    // @ts-ignore
    const resEvents: EventRecord[] = events;
    for (const event of resEvents) {
        const eventMethod = `${event.event.section}.${event.event.method}`;
        const _shadowApi = await shadowApi.isReadyOrError;
        if (sectionMethod == eventMethod) {
            BridgeLog.info(`Find new bridge transfer at block ${bn}`)
            const dest_id = event.event.data[0]
            if (dest_id.toHuman() == destId) {
                const nonce = event.event.data[1]
                const resource_id = event.event.data[2]
                const amount = event.event.data[3]
                const recipient = event.event.data[4]
                const shadowAddress = keyring.encodeAddress(keyring.decodeAddress(recipient.toHuman()?.toString()), 66)
                BridgeLog.info(`New bridge transfer at block ${bn} to ${shadowAddress} amount ${amount}`)
                const call = _shadowApi.tx.bridgeTransfer.transfer(shadowAddress, amount, "")
                const tx = _shadowApi.tx.chainBridge.acknowledgeProposal(nonce, 1, resource_id, call);
                bridgeTxPool.push({
                    blockNumber: bn,
                    tx
                })
            }
            emitter.emit('msg');
        }
    }}
