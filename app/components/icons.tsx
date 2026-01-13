import type { JSX } from "react";

export function DocIcon(): JSX.Element {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 3h7l3 3v15a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Z"
        stroke="#2563eb"
        strokeWidth="2"
      />
      <path d="M14 3v4a2 2 0 0 0 2 2h4" stroke="#2563eb" strokeWidth="2" />
      <path
        d="M8 13h8M8 17h8M8 9h4"
        stroke="#2563eb"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CodeIcon(): JSX.Element {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M8 9 5 12l3 3M16 9l3 3-3 3"
        stroke="#2563eb"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 7 10 17"
        stroke="#2563eb"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
