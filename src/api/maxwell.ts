import { ApiPromise, WsProvider } from '@polkadot/api';
import { logger } from '@polkadot/util';
import { maxwellChainEndpoint } from '../env';
import maxwellTypes from './maxwellTypes';
const l = logger('maxwell-api');

export const maxwellApi: ApiPromise = new ApiPromise({
    provider: new WsProvider(maxwellChainEndpoint || 'ws://localhost:9944'),
    types: maxwellTypes,
});

maxwellApi.on('connected', () => {
    l.log(`MAXWELL API has been connected to the endpoint: ${maxwellChainEndpoint}`)
})

maxwellApi.on('disconnected', (): void => {
    l.error('API has been disconnected from the endpoint')
    process.exit(0)
});