import { ApiPromise, WsProvider } from '@polkadot/api';
import { logger } from '@polkadot/util';
import { parachainEndpoint } from '../env';
const l = logger('parachain-api');

export const parachainApi: ApiPromise = new ApiPromise({
    provider: new WsProvider(parachainEndpoint || 'ws://localhost:9944')
});

parachainApi.on('connected', () => {
    l.log(`PARACHAIN API has been connected to the endpoint: ${parachainEndpoint}`)
})

parachainApi.on('disconnected', (): void => {
    l.error('API has been disconnected from the endpoint')
    process.exit(0)
});

parachainApi.on('error', () => {
    l.log(`PARACHAIN API connected error`)
    process.exit(0)
})