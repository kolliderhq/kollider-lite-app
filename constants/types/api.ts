type T_Method = 'get' | 'post' | 'delete';

export type I_API = Readonly<{
	BASE: Record<string, string | string[]>;
	API: Record<
		string,
		{
			route: (...args: any[]) => string;
			method: T_Method;
			base: string;
			stale: number;
			createBody?: (params: Record<string, any>) => Record<string, any>;
			requiredBodyParams?: string[];
			customOptions?: Record<string, any>;
			allowNull?: boolean; //	true if null values are allowed
			simple?: boolean; //	true if no refiner
		}
	>;
}>;

export enum API_ROLE {
	VIEWONLY = 'ViewOnly',
	TRADE = 'Trade',
	TRANSFER = 'Transfer',
}
