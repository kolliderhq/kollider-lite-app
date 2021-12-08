import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import { RootState } from 'contexts/modules/rootReducer';
import type { AppDispatch } from 'contexts/store';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
