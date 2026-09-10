// The one same-page anchor shared across components, as a plain value.
//
// It used to be `export const GET_APP` inside nav.tsx, a `'use client'` file.
// Next's Server Components boundary treats EVERY export of a client module as
// an opaque client reference, even a plain string — a Server Component that
// imports it gets a stub that throws if used as a value instead of rendered
// as a component. hero.tsx, two-audiences.tsx and footer.tsx are Server
// Components and used it as a plain string in an href, so every one of those
// links silently rendered a broken `href` (a serialized error message) —
// caught 2026-09-10 by hero.spec.ts and two-audiences.spec.ts, not by eye,
// because the anchor still LOOKED like a pill; only its target was wrong.
// Nav's own copy of the link (defined and used in the same client file) was
// never affected, which is why the bug hid behind a passing anchors.spec.ts.
export const GET_APP = '#get-the-app';
