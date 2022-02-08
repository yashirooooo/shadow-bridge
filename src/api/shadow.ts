import { ApiPromise, WsProvider } from '@polkadot/api';
import { logger } from '@polkadot/util';
import { shadowChainEndpoint } from '../env';
const l = logger('shadow-api');

export const shadowApi: ApiPromise = new ApiPromise({
    provider: new WsProvider(shadowChainEndpoint || 'ws://localhost:9944')
});

shadowApi.on('connected', () => {
    l.log(`SHADOW API has been connected to the endpoint: ${shadowChainEndpoint}`)
})

shadowApi.on('disconnected', (): void => {
    l.error('API has been disconnected from the endpoint')
    process.exit(0)
});