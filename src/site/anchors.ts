// A plain module, not nav.tsx: every export of a 'use client' file is a client reference,
// which a Server Component can render but cannot read as a string.
export const GET_APP = '#get-the-app';
