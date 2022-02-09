// Load env

// eslint-disable-next-line node/no-extraneous-require
require('dotenv').config();

export const port = process.env.port
export const maxwellChainEndpoint = process.env.MAXWELL_CHAIN_ENDPOINT as string;
export const shadowChainEndpoint = process.env.SHADOW_CHAIN_ENDPOINT as string;
export const seeds = process.env.SEEDS as string;
export const latestBlock = Number(process.env.LATESTBLOCK)
export const destId = Number(process.env.DESTID)
export const sectionMethod = process.env.SECTIONMETHOD as string
