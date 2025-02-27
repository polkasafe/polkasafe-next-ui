import { NotificationStatus } from '@common/enum/substrate';

export const ERROR_MESSAGES = {
	TRANSACTION_FAILED: {
		message: 'Transaction failed',
		description: 'Transaction failed to send',
		status: NotificationStatus.ERROR
	},
	CREATE_MULTISIG_FAILED: {
		message: 'Create Multisig failed',
		description: 'Create Multisig failed',
		status: NotificationStatus.ERROR
	},
	LINKED_MULTISIG_FAILED: {
		message: 'Link Multisig failed',
		description: 'Link Multisig failed',
		status: NotificationStatus.ERROR
	},
	CREATE_ORGANISATION_FAILED: {
		message: 'Create Organisation failed',
		description: 'There was some problem creating your organisation',
		status: NotificationStatus.ERROR
	},
	UPDATE_ORGANISATION_FAILED: {
		message: 'Update Organisation failed',
		description: 'There was some problem updating your organisation',
		status: NotificationStatus.ERROR
	},
	INVALID_ADDRESS: {
		message: 'Invalid Address',
		description: 'Address is invalid',
		status: NotificationStatus.ERROR
	},
	UPDATE_MULTISIG_FAILED: {
		message: 'Update Multisig failed',
		description: 'Update Multisig failed',
		status: NotificationStatus.ERROR
	},
	ADD_ADDRESS_FAILED: {
		message: 'Add Address failed',
		description: 'Address failed to add',
		status: NotificationStatus.ERROR
	},
	REMOVE_ADDRESS_FAILED: {
		message: 'Remove Address failed',
		description: 'Address failed to remove',
		status: NotificationStatus.ERROR
	},
	CREATE_PROXY_FAILED: {
		message: 'Create Proxy failed',
		description: 'Create Proxy failed',
		status: NotificationStatus.ERROR
	},
	TRANSACTION_BUILD_FAILED: {
		message: 'Transaction Build failed',
		description: 'Transaction Build failed',
		status: NotificationStatus.ERROR
	},
	AUTHENTICATION_FAILED: {
		message: 'Authentication failed',
		description: 'Not Authenticated',
		status: NotificationStatus.ERROR
	},
	API_NOT_CONNECTED: {
		message: 'API not connected',
		description: 'API not connected',
		status: NotificationStatus.ERROR
	},
	NO_RECIPIENT: {
		message: 'No Recipient',
		description: 'No recipient found OR amount is 0',
		status: NotificationStatus.ERROR
	},
	INVALID_TRANSACTION: {
		message: 'Invalid Transaction',
		description: 'Invalid Transaction',
		status: NotificationStatus.ERROR
	},
	WALLET_NOT_FOUND: {
		message: 'Wallet not found',
		description: 'Wallet not found',
		status: NotificationStatus.ERROR
	},
	NO_CHANGES: {
		message: 'No Changes',
		description: 'No changes found',
		status: NotificationStatus.ERROR
	},
	NOTIFICATIONS_ERROR: {
		message: 'Notifications Error',
		description: 'Notifications failed to update',
		status: NotificationStatus.ERROR
	},
	INVALID_EMAIL: {
		message: 'Invalid Email',
		description: 'Email is invalid',
		status: NotificationStatus.ERROR
	},
	ERROR_IN_SENDING_EMAIL: {
		message: 'Error in sending email',
		description: 'Error in sending email',
		status: NotificationStatus.ERROR
	},
	ERROR_IN_ADDING_WATCHLIST: {
		message: 'Error in adding watchlist',
		description: 'Error in adding watchlist',
		status: NotificationStatus.ERROR
	}
};

export const SUCCESS_MESSAGES = {
	TRANSACTION_SUCCESS: {
		message: 'Transaction Success',
		description: 'Transaction has been sent successfully',
		status: NotificationStatus.SUCCESS
	},
	TRANSACTION_APPROVE_SUCCESS: {
		message: 'Approved',
		description: 'Transaction has been approved successfully',
		status: NotificationStatus.SUCCESS
	},
	TRANSACTION_REJECT_SUCCESS: {
		message: 'Cancelled',
		description: 'Transaction has been cancelled successfully',
		status: NotificationStatus.SUCCESS
	},
	CREATE_MULTISIG_SUCCESS: {
		message: 'Create Multisig Success',
		description: 'Create Multisig has been sent successfully',
		status: NotificationStatus.SUCCESS
	},
	LINKED_MULTISIG_SUCCESS: {
		message: 'Link Multisig Success',
		description: 'Link Multisig has been sent successfully',
		status: NotificationStatus.SUCCESS
	},
	CREATE_ORGANISATION_SUCCESS: {
		message: 'New Organisation Created',
		description: '',
		status: NotificationStatus.SUCCESS
	},
	UPDATE_ORGANISATION_SUCCESS: {
		message: 'Organisation Updated',
		description: '',
		status: NotificationStatus.SUCCESS
	},
	ADD_ADDRESS_SUCCESS: {
		message: 'Add Address Success',
		description: 'Address has been added successfully',
		status: NotificationStatus.SUCCESS
	},
	REMOVE_ADDRESS_SUCCESS: {
		message: 'Remove Address Success',
		description: 'Address has been removed successfully',
		status: NotificationStatus.SUCCESS
	},
	UPDATE_MULTISIG_SUCCESS: {
		message: 'Update Multisig Success',
		description: 'Update Multisig has been sent successfully',
		status: NotificationStatus.SUCCESS
	},
	CREATE_PROXY_SUCCESS: {
		message: 'Create Proxy Success',
		description: 'Create Proxy has been sent successfully',
		status: NotificationStatus.SUCCESS
	},
	NOTIFICATIONS_UPDATED: {
		message: 'Notifications Updated',
		description: 'Notifications have been updated successfully',
		status: NotificationStatus.SUCCESS
	}
};

export const INFO_MESSAGES = {
	TRANSACTION_IN_BLOCK: {
		message: 'Transaction in Block',
		description: 'Transaction has been sent and is in block',
		status: NotificationStatus.INFO
	}
};
