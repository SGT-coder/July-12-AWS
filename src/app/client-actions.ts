// This file is a client-side entry point to access server actions.
// By re-exporting server actions from a file with a "use client" directive,
// we can ensure that they are correctly bundled and invoked from other
// client components without causing "Invalid Server Actions request" errors.
"use client";

export * from './actions';
