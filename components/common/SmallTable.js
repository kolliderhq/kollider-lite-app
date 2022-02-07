import cn from 'clsx';

export const SmallTableLabel = ({ label, className }) => {
	return <div className={cn('text-gray-400', className)}>{label}</div>;
};
