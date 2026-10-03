import { LinearTransition } from 'react-native-reanimated';

/**
 * Shared layout spring — soft, slightly underdamped, no bounce-back jitter. Used by the live
 * route reorder and by route cards expanding, so both move with the same feel.
 */
export const layoutSpring = LinearTransition.springify().damping(19).stiffness(150).mass(0.9);
