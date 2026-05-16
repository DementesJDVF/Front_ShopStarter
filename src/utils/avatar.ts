import { createAvatar } from '@dicebear/core';
import { identicon } from '@dicebear/collection';

export const getUserAvatar = (seed: string): string => {
  const avatar = createAvatar(identicon, {
    seed,
    size: 128,
  });
  return avatar.toDataUri();
};