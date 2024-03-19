/* eslint-disable sort-keys */
/* eslint-disable no-restricted-syntax */
import { SafeAppAccessPolicyTypes, SafeAppData } from '@safe-global/safe-gateway-typescript-sdk';
import { useEffect, useState } from 'react';

export type SafeAppDataWithPermissions = SafeAppData;

type UseSafeAppFromManifestReturnType = {
	safeApp: SafeAppDataWithPermissions;
	isLoading?: boolean;
};

type AppManifestIcon = {
	src: string;
	sizes: string;
	type?: string;
	purpose?: string;
};

export type AppManifest = {
	// SPEC: https://developer.mozilla.org/en-US/docs/Web/Manifest
	name: string;
	short_name?: string;
	description: string;
	icons?: AppManifestIcon[];
	iconPath?: string;
};

const isAppManifestValid = (json: unknown): json is AppManifest => {
	return (
		json != null &&
		typeof json === 'object' &&
		'name' in json &&
		'description' in json &&
		('icons' in json || 'iconPath' in json)
	);
};

const trimTrailingSlash = (url: string): string => {
	return url.replace(/\/$/, '');
};

const fetchAppManifest = async (appUrl: string, timeout = 5000): Promise<unknown> => {
	const normalizedUrl = trimTrailingSlash(appUrl);
	const manifestUrl = `${normalizedUrl}/manifest.json`;

	// A lot of apps are hosted on IPFS and IPFS never times out, so we add our own timeout
	const controller = new AbortController();
	const id = setTimeout(() => controller.abort(), timeout);

	const response = await fetch(manifestUrl, {
		signal: controller.signal
	});
	clearTimeout(id);

	if (!response.ok) {
		throw new Error(`Failed to fetch manifest from ${manifestUrl}`);
	}

	return response.json();
};

const chooseBestIcon = (icons: AppManifestIcon[]): string => {
	const svgIcon = icons.find((icon) => icon?.sizes?.includes('any') || icon?.type === 'image/svg+xml');

	if (svgIcon) {
		return svgIcon.src;
	}

	for (const icon of icons) {
		for (const size of icon.sizes.split(' ')) {
			if (Number(size.split('x')[0]) >= 128) {
				return icon.src;
			}
		}
	}

	return icons[0].src || '';
};

const relativeFirstCharacters = ['.', '/'];
const isRelativeUrl = (url: string): boolean => {
	return relativeFirstCharacters.indexOf(url[0]) > -1;
};

const getAppLogoUrl = (appUrl: string, { icons = [], iconPath = '' }: AppManifest) => {
	const iconUrl = icons.length ? chooseBestIcon(icons) : iconPath;
	const includesBaseUrl = iconUrl.startsWith('https://');
	if (includesBaseUrl) {
		return iconUrl;
	}

	return `${appUrl}${isRelativeUrl(iconUrl) ? '' : '/'}${iconUrl}`;
};

const fetchSafeAppFromManifest = async (
	appUrl: string,
	currentChainId: string
): Promise<SafeAppDataWithPermissions> => {
	const normalizedAppUrl = trimTrailingSlash(appUrl);
	const appManifest = await fetchAppManifest(appUrl);

	if (!isAppManifestValid(appManifest)) {
		throw new Error('Invalid Safe App manifest');
	}

	const iconUrl = getAppLogoUrl(normalizedAppUrl, appManifest);

	return {
		id: Math.random(),
		url: normalizedAppUrl,
		name: appManifest.name,
		description: appManifest.description,
		accessControl: { type: SafeAppAccessPolicyTypes.NoRestrictions },
		tags: [],
		features: [],
		socialProfiles: [],
		developerWebsite: '',
		chainIds: [currentChainId],
		iconUrl
	};
};

const useSafeAppFromManifest = (appUrl: string, chainId: string): UseSafeAppFromManifestReturnType => {
	const [data, setData] = useState<SafeAppData>();

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await fetchSafeAppFromManifest(appUrl, chainId);
				if (res) {
					setData(res);
				}
			} catch (err) {
				console.log(err);
			}
		};
		fetchData();
	}, [appUrl, chainId]);

	return { safeApp: data };
};

export { useSafeAppFromManifest };
