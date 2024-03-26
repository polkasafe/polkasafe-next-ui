// /**
//  * The analytics service.
//  *
//  * Exports `trackEvent` and event types.
//  * `trackEvent` is supposed to be called by UI components.
//  *
//  * The event definitions are in the `events` folder.
//  *
//  * Usage example:
//  *
//  * `import { trackEvent, ADDRESS_BOOK_EVENTS } from '@/services/analytics'`
//  * `trackEvent(ADDRESS_BOOK_EVENTS.EXPORT)`
//  */
// // import { gtmTrack, gtmTrackSafeApp } from './gtm';
// import { EventType } from './types';
// export const SAFE_APPS_CATEGORY = 'safe-apps';
// export const SAFE_APPS_SDK_CATEGORY = 'safe-apps-sdk';

// const SAFE_APPS_EVENT_DATA = {
// 	event: EventType.SAFE_APP,
// 	category: SAFE_APPS_CATEGORY
// };
// export const trackEvent = gtmTrack;
// export const trackSafeAppEvent = gtmTrackSafeApp;
// export const SAFE_APPS_EVENTS = {
// 	OPEN_APP: {
// 		...SAFE_APPS_EVENT_DATA,
// 		action: 'Open Safe App'
// 	},
// 	PIN: {
// 		...SAFE_APPS_EVENT_DATA,
// 		action: 'Pin Safe App'
// 	},
// 	UNPIN: {
// 		...SAFE_APPS_EVENT_DATA,
// 		action: 'Unpin Safe App'
// 	},
// 	COPY_SHARE_URL: {
// 		...SAFE_APPS_EVENT_DATA,
// 		action: 'Copy Share URL'
// 	},
// 	SEARCH: {
// 		...SAFE_APPS_EVENT_DATA,
// 		action: 'Search for Safe App'
// 	},
// 	ADD_CUSTOM_APP: {
// 		...SAFE_APPS_EVENT_DATA,
// 		action: 'Add custom Safe App'
// 	},
// 	PROPOSE_TRANSACTION: {
// 		...SAFE_APPS_EVENT_DATA,
// 		action: 'Propose Transaction'
// 	},
// 	PROPOSE_TRANSACTION_REJECTED: {
// 		...SAFE_APPS_EVENT_DATA,
// 		action: 'Propose Transaction Rejected'
// 	},
// 	SHARED_APP_LANDING: {
// 		...SAFE_APPS_EVENT_DATA,
// 		action: 'Shared App landing page visited'
// 	},
// 	SHARED_APP_CHAIN_ID: {
// 		...SAFE_APPS_EVENT_DATA,
// 		action: 'Shared App chainId'
// 	},
// 	SHARED_APP_OPEN_DEMO: {
// 		...SAFE_APPS_EVENT_DATA,
// 		action: 'Open demo safe from shared app'
// 	},
// 	SHARED_APP_OPEN_AFTER_SAFE_CREATION: {
// 		...SAFE_APPS_EVENT_DATA,
// 		action: 'Open shared app after Safe creation'
// 	},

// 	// SDK
// 	SAFE_APP_SDK_METHOD_CALL: {
// 		...SAFE_APPS_EVENT_DATA,
// 		category: SAFE_APPS_SDK_CATEGORY,
// 		action: 'SDK method call'
// 	}
// };
// export * from './types';
// // export * from './events';
