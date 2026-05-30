export const CONTRACT_ADDRESS = (
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? '0x'
) as `0x${string}`;

export const LEADERBOARD_ABI = [
  {
    name: 'submitLevel',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'level', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'bestLevel',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'LevelRecorded',
    type: 'event',
    inputs: [
      { name: 'player', type: 'address', indexed: true },
      { name: 'level', type: 'uint256', indexed: false },
      { name: 'best', type: 'uint256', indexed: false },
    ],
  },
] as const;
