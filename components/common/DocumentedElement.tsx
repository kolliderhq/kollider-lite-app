import * as React from 'react';
import { ReactNode } from 'react';
import ReactTooltip from 'react-tooltip';

import cn from 'clsx';
import isString from 'lodash-es/isString';

export const DocumentedElement = ({
	children,
	tooltipId,
	tooltipContents,
	clickLink = '',
	styles = true,
	addTitle = false,
}: {
	children: ReactNode;
	tooltipId: string;
	tooltipContents: ReactNode;
	clickLink?: string;
	styles?: boolean;
	addTitle?: boolean;
}) => {
	const onClick = React.useCallback(
		e => {
			e.preventDefault();
			window.open(clickLink, '_blank');
		},
		[clickLink]
	);

	return (
		<>
			<ReactTooltip id={`tooltip-${tooltipId}`} type="dark" effect="solid">
				{isString(tooltipContents) ? (
					<span>{tooltipContents}</span>
				) : addTitle ? (
					<TitledTooltip title={tooltipId} content={tooltipContents} />
				) : (
					tooltipContents
				)}
			</ReactTooltip>
			{clickLink !== '' ? (
				<a
					className={cn('w-fit s-documented', { 's-documented-styled': styles })}
					onClick={onClick}
					href={clickLink}
					data-tip
					data-for={`tooltip-${tooltipId}`}>
					{children}
				</a>
			) : (
				<div
					className={cn('w-fit s-documented cursor-default', { 's-documented-styled': styles })}
					data-tip
					data-for={`tooltip-${tooltipId}`}>
					{children}
				</div>
			)}
		</>
	);
};

const TitledTooltip = ({ title, content }) => {
	return (
		<p className="text-center text-xs cursor-">
			<span className="text-yellow-400">{title}</span>
			<br />
			{content}
		</p>
	);
};
