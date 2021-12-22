import { Action, Dispatch } from 'redux';

import { defaultLocalStore } from 'contexts/custom';
import { RootState } from 'contexts/store';

export const persistMiddleware = ({ dispatch, getState }: { dispatch: Dispatch; getState: () => RootState }) => {
	return (next: (action: Action) => void) => {
		return (action: Action) => {
			next(action);

			if (action.type.includes('settings/')) {
				const settings = getState().settings;
				defaultLocalStore.set('settings', { ...settings });
			}
		};
	};
};
