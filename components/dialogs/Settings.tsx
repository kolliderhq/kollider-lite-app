import React from 'react';

import cn from 'clsx';

import { setOnlyWeblnIfEnabled, setWeblnAutoWithdraw } from 'contexts';
import { useAppDispatch, useAppSelector } from 'hooks';

export const SettingsDialog = () => {
	const dispatch = useAppDispatch();
	const { weblnAutoWithdraw, onlyWeblnIfEnabled } = useAppSelector(state => state.settings);

	return (
		<div className="w-full h-full mt-5">
			<h2 className="text-center text-2xl xs:text-3xl">Settings</h2>
			<section className="container-spacious container-children-bottom-border mt-5">
				<SettingsSwitch
					label="Auto withdraw 100+ SATS with Webln"
					value={!!weblnAutoWithdraw}
					onClick={() => dispatch(setWeblnAutoWithdraw(weblnAutoWithdraw === 0 ? 100 : 0))}
				/>
				<SettingsSwitch
					label="Hide invoice if Webln is enabled"
					value={onlyWeblnIfEnabled}
					onClick={() => dispatch(setOnlyWeblnIfEnabled(!onlyWeblnIfEnabled))}
				/>
			</section>
		</div>
	);
};

const SettingsSwitch = ({ label, value, onClick }: { label: string; value: boolean; onClick: () => void }) => {
	return (
		<div className="w-full py-2 my-1 ">
			<p className="leading-tight text-xs xs:text-sm text-right mb-1">{label}</p>
			<div className="flex justify-end">
				<Switch value={value} onClick={onClick} />
			</div>
		</div>
	);
};

const Switch = ({ value, onClick }: { value: boolean; onClick: () => void }) => {
	return (
		<div
			role="presentation"
			data-cy="button-instant-toggle"
			onClick={() => onClick()}
			className={cn(
				!!value ? 'bg-green-400' : 'bg-gray-600',
				'relative w-11 h-6 rounded-full border border-gray-400 flex items-center justify-between cursor-pointer s-transition-all'
			)}>
			<div
				style={{ width: '24px', height: '24px', left: !!value ? '19px' : '-1px', top: '-1px' }}
				className={cn(
					's-transition-all absolute rounded-full flex items-center justify-center bg-white border-gray-400 border'
				)}>
				<div className="text-xs mr-0.25 px-2" />
			</div>
		</div>
	);
};
