"use client";

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

// Server-rendered controls must not accept input before React attaches handlers;
// otherwise hydration can discard fast typing or autofill on a slow connection.
export function useFormReady() {
  return useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
}
