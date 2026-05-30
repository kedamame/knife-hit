import { Attribution } from 'ox/erc8021';

const BUILDER_CODE = process.env.NEXT_PUBLIC_BUILDER_CODE ?? 'bc_06vnarrm';

export const DATA_SUFFIX = Attribution.toDataSuffix({ codes: [BUILDER_CODE] });
