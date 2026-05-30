import { Attribution } from 'ox/erc8021';

const BUILDER_CODE = process.env.NEXT_PUBLIC_BUILDER_CODE ?? 'bc_6wp6q0gw';

export const DATA_SUFFIX = Attribution.toDataSuffix({ codes: [BUILDER_CODE] });
