import { Easing, WithSpringConfig, WithTimingConfig } from "react-native-reanimated";

// Reusable animation configs — keep motion language consistent across the app.

export const spring = {
  // snappy, native feel — used for press / scale / dismiss
  default: { damping: 18, stiffness: 220, mass: 1 } satisfies WithSpringConfig,
  // gentler, used for sheet presentation and large layout
  soft: { damping: 22, stiffness: 140, mass: 1 } satisfies WithSpringConfig,
  // bouncier, for celebration / success
  bouncy: { damping: 10, stiffness: 200, mass: 1 } satisfies WithSpringConfig,
};

export const timing = {
  fast: { duration: 160, easing: Easing.out(Easing.cubic) } satisfies WithTimingConfig,
  base: { duration: 240, easing: Easing.out(Easing.cubic) } satisfies WithTimingConfig,
  slow: { duration: 420, easing: Easing.out(Easing.cubic) } satisfies WithTimingConfig,
  ease: { duration: 280, easing: Easing.inOut(Easing.cubic) } satisfies WithTimingConfig,
};

// Stagger helper — for list entrance animations.
export const staggerDelay = (index: number, step = 60, max = 8) =>
  Math.min(index, max) * step;
