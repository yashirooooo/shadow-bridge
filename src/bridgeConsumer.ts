import { bridgeTxPool, emitter } from "./blockParser"
import { sendTx, TX_RESULT_CODE } from "./tx";
import { seeds } from "./env";
import { timeout } from "promise-timeout";
import Block from "./db";
import { logger } from '@polkadot/util';
import BridgeLog from "./log";

const l = logger('block-consumer');

export const apiLocker = {};

export const consumer = async () => {
    console.log('bridgeTxPool', bridgeTxPool)
    const txObj = bridgeTxPool.shift()
    if (txObj) {    
        const txResult = await handleWithLock(apiLocker, 'apply', async () => {
            return sendTx(txObj.blockNumber, txObj.tx, seeds as string);
        }, {
            status: false,
            code: TX_RESULT_CODE.busy,
            message: "tx api is busy, please try it later."
        });
        const content = `block: ${txObj.blockNumber} with tx result ${JSON.stringify(txResult)}`;
        if (txResult.status) {
            Block.update(1, txObj.blockNumber, (err: any, _data: any) => {
                if (err) {
                    l.error(`update block error ${JSON.stringify(err)}`)
                } else {
                    emitter.emit('msg');
                }
            })
        } else {
            if (txResult.code == TX_RESULT_CODE.busy) {
                bridgeTxPool.unshift(txObj)
            } else if (txResult.code == TX_RESULT_CODE.failed) {
                emitter.emit('msg');
            }
        }
        BridgeLog.info(content);
    }
}

export async function handleWithLock(lockTx: any, key: string, handler: Function, error: any) {
    if (lockTx[key]) {
        return error;
    }
    try {
        lockTx[key] = true;
        return await timeout(
            new Promise((resolve, _) => {
              handler().then(resolve).catch(process.exit(0));
            }),
            2 * 60 * 1000 // 2 min will timeout
        );
    } finally {
        delete lockTx[key];
    }
}
