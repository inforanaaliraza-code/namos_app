/**
 * Redux Hooks
 * Optimized with memoization for better performance
 */

import { TypedUseSelectorHook, useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useMemo } from 'react';
import type { RootState, AppDispatch } from './index';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * Memoized selector hook for better performance
 * Use this when selecting complex nested objects to avoid unnecessary re-renders
 */
export function useAppSelectorMemoized<T>(
    selector: (state: RootState) => T,
    equalityFn?: (left: T, right: T) => boolean
): T {
    return useSelector(selector, equalityFn || shallowEqual);
}
