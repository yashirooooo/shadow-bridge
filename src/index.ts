import { logger } from '@polkadot/util';
import { parachainApi } from './api/parachain'
import { Header} from '@polkadot/types/interfaces';
import { latestBlock, port } from './env';
import { handleBlock } from './blockParser';
import Block from './db';
import _ from 'lodash';
import BridgeLog from './log';
const express = require('express');
const app = express();
const l = logger('index');

let currentBlock = latestBlock;

app.get('/block', (_req: { params: { id: any; }; }, res: { send: (arg0: any) => void; }, next: (arg0: any) => any) => {
    Block.find(1, (err: any, block: any) => {
        if (err) return next(err);
        res.send(block)
    })
});

app.get('/update/:number', (req: { params: { number: number; }; }, res: any, _next: any) => {
    currentBlock = Number(req.params.number)
    res.send({
        status: 'success'
    })
})

const main = async () => {
    Block.find(1, (error: any, block: any) => {
        if (error) {
            console.log('error', error)
        } else {
            if (block) {
                currentBlock = block.number
            } else {
                Block.create(currentBlock, (err: any, _block: any) => {
                    if (err) {
                        l.error('Init block error', err)
                    }
                })
            }
        }
    })
    const _parachainApi = await parachainApi.isReadyOrError;
    
     // 监听finalized块
    const subscribeFinalized = async (handler: (b: Header) => void) => {
        return await _parachainApi.rpc.chain.subscribeFinalizedHeads((head: Header) =>
            handler(head)
        );
    }

    // 块处理器
    const handler = async (b: Header) => {
        const chainBn = b.number.toNumber();
        BridgeLog.debug(`Subscribe inalized number ${chainBn}`)
        if (currentBlock < chainBn) {
            let tmpBN = currentBlock;
            currentBlock = chainBn
            for (let bn = tmpBN; bn < currentBlock; bn++) {
                const _api = await parachainApi.isReadyOrError;
                try {
                    await handleBlock(_api, bn)
                    Block.update(1, bn, (err: any, _data: any) => {
                        if (err) {
                            l.error(`update block error ${JSON.stringify(err)}`)
                        }
                    }); 
                } catch (error) {
                    console.log(`handle block error: ${error}`);
                    process.exit(0);
                }
            }
        } else {
            Block.update(1, chainBn, (err: any, _data: any) => {
                if (err) {
                    l.error(`update block error ${JSON.stringify(err)}`)
                }
            });
        }
    }

    await subscribeFinalized(handler);
}

process.on('uncaughtException', (err: Error) => {
    l.error(`☄️ [global] Uncaught exception ${err.message}`);
    process.exit(0)
});

process.on('unhandledRejection', (err: Error) => {
    l.error(`☄️ [global] unhandledRejection exception ${err.message}`);
    process.exit(0)
})

main().then().catch()

app.listen(port, () => {
    console.log(`server susscess localhost:${port}`)
})