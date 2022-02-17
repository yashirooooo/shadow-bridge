import { ApiPromise, WsProvider } from '@polkadot/api';
import { logger } from '@polkadot/util';
import { mainnetChainEndpoint } from '../env';
const l = logger('mainnet-api');
import { typesBundleForPolkadot } from '@crustio/type-definitions';

export const mainnetApi: ApiPromise = new ApiPromise({
    provider: new WsProvider(mainnetChainEndpoint || 'ws://localhost:9944'),
    typesBundle: typesBundleForPolkadot,
});

mainnetApi.on('connected', () => {
    l.log(`MAINNET API has been connected to the endpoint: ${mainnetChainEndpoint}`)
})

mainnetApi.on('disconnected', (): void => {
    l.error('API has been disconnected from the endpoint')
    process.exit(0)
});