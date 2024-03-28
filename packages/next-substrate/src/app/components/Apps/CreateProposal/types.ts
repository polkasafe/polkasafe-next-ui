/* eslint-disable @typescript-eslint/naming-convention */
import BN from 'bn.js';

export enum EReferenda {
	CREATE_PROPOSAL = 'Create a Referenda',
	CANCEL_PROPOSAL = 'Cancel a Referenda',
	KILL_PROPOSAL = 'Kill a Referenda'
}

export interface FormState {
	palletRpc: string;
	callable: string;
	inputParams: any[];
}

export enum EKillOrCancel {
	KILL = 'kill',
	CANCEL = 'cancel'
}

export enum EEnactment {
	At_Block_No = 'at_block_number',
	After_No_Of_Blocks = 'after_no_of_Blocks'
}

export interface IEnactment {
	key: EEnactment | null;
	value: BN | null;
}

export interface IAdvancedDetails {
	afterNoOfBlocks: BN | null;
	atBlockNo: BN | null;
}
