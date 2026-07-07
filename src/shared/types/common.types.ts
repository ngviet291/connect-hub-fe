export type UUID = string;

export const Visibility = {
  PUBLIC: 'PUBLIC',
  FOLLOWERS: 'FOLLOWERS',
  PRIVATE: 'PRIVATE',
} as const;

export type Visibility = typeof Visibility[keyof typeof Visibility];
