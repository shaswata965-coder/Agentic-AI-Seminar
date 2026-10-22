export type Expression =
  | "neutral"
  | "happy"
  | "love"
  | "star"
  | "surprised"
  | "sleepy"
  | "wink"
  | "focus"
  | "code"
  | "determined"
  | "curious"
  | "confused";

export type Pose =
  | "idle"
  | "wave"
  | "hold"
  | "holdBoth"
  | "holdSide"
  | "raise"
  | "holdWide"
  | "toFace"
  | "point"
  | "think"
  | "cheer"
  | "type";

export type PropKind =
  | "heartPulse"
  | "flask"
  | "rocket"
  | "clipboard"
  | "mic"
  | "book"
  | "tablet"
  | "laptop"
  | "trophy"
  | "ticket"
  | "megaphone"
  | "mapPin"
  | "suitcase"
  | "magnifier"
  | "paperPlane"
  | "wrench"
  | "camera"
  | "clapper"
  | "bigHeart"
  | "stopwatch"
  | "signboard";

export type Headwear = "gradCap" | "hardHat" | "partyHat" | "headset";
export type Wear = "stethoscope";
export type Emblem =
  | "spark"
  | "cross"
  | "atom"
  | "bulb"
  | "clock"
  | "code"
  | "star"
  | "gear"
  | "heart"
  | "play"
  | "check"
  | "pin";

export type Effect =
  | "orbit"
  | "sparkles"
  | "zzz"
  | "confetti"
  | "waves"
  | "question"
  | "bulb"
  | "code"
  | "hearts"
  | "spotlight"
  | "scan"
  | "flash"
  | "pulse";

export interface AuraLook {
  expression: Expression;
  pose: Pose;
  prop?: PropKind;
  headwear?: Headwear;
  wear?: Wear;
  emblem?: Emblem;
  effects?: Effect[];
  /** Colour of the eyes / chest glow. Defaults to Aura's signature aqua. */
  eyeColor?: string;
}

export type AuraVariant =
  | "hero"
  | "guide"
  | "thinker"
  | "healthcare"
  | "science"
  | "enterprise"
  | "programme"
  | "countdown"
  | "speakers"
  | "tutorials"
  | "demos"
  | "hackathon"
  | "trophy"
  | "registration"
  | "success"
  | "announcements"
  | "kiosks"
  | "venue"
  | "travel"
  | "sponsors"
  | "organisers"
  | "volunteers"
  | "faq"
  | "answer"
  | "contact"
  | "notFound"
  | "loading"
  | "sleep"
  | "admin"
  | "gallery"
  | "recordings"
  | "assistant"
  | "error";

export interface AuraPreset extends AuraLook {
  /** Accessible description of this representation. */
  label: string;
  /** Speech-bubble lines Aura cycles through when clicked. */
  tips: string[];
}
