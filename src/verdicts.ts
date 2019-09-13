import { Verdict } from "./types";

export const SHOULD_APPROVE = "SHOULD_APPROVE";
export const NEEDS_HUMAN_REVIEW = "NEEDS_HUMAN_REVIEW";

export function shouldApprove(text: string): Verdict {
  return { text, verdict: SHOULD_APPROVE };
}

export function needsHumanReview(text: string): Verdict {
  return { text, verdict: NEEDS_HUMAN_REVIEW };
}

export function joinVerdicts(verdicts: Verdict[], separator: string): Verdict {
  const joinedText = verdicts.map(v => v.text).join(separator);
  const joinedVerdict = verdicts.some(v => v.verdict === NEEDS_HUMAN_REVIEW)
    ? NEEDS_HUMAN_REVIEW
    : SHOULD_APPROVE;
  return { text: joinedText, verdict: joinedVerdict };
}
