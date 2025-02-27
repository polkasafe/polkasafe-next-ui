import { ETransactionFieldsUpdateType, NotificationStatus } from '@common/enum/substrate';
import { queueNotification } from '@common/global-ui-components/QueueNotification';
import TransactionFields from '@common/global-ui-components/TransactionFields'
import { IOrganisation, ITransactionCategorySubfields, ITransactionFields } from '@common/types/substrate'
import React, { useState } from 'react'
import { addNewCategory } from '@sdk/polkasafe-sdk/src/add-new-category';
import { useUser } from '@substrate/app/atoms/auth/authAtoms';

const TransactionFieldsSubstrate = ({ transactionFields, organisation, setOrganisation }: { transactionFields: ITransactionFields; organisation: IOrganisation; setOrganisation: any }) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [category, setCategory] = useState<string>(Object.keys(transactionFields)[0] || 'none');

    const [user] = useUser();

    const handleSave = async (updateType: ETransactionFieldsUpdateType, fieldName: string, fieldDesc: string, subfields?: ITransactionCategorySubfields, onCancel?: () => void) => {
		try {
            if (!user) {
                throw new Error('User not found');
            }
    
            if (!organisation || !organisation.id) {
                throw new Error('Organisation not found');
            }

            setLoading(true);

            if (updateType === ETransactionFieldsUpdateType.ADD_CATEGORY) {
                const { data } = (await addNewCategory({ address: user.address, signature: user.signature, organisationId: organisation.id, transactionFields: {
                    ...transactionFields,
                    [fieldName.toLowerCase().split(' ').join('_')]: {
                        fieldDesc,
                        fieldName,
                        subfields: {}
                    }
                }  })) as { data: string };
                if (data && data === 'success') {
                    setLoading(false);
                    queueNotification({
                        header: 'Success!',
                        message: 'Transaction Fields Updated.',
                        status: NotificationStatus.SUCCESS
                    });
                    setOrganisation({ ...organisation, transactionFields: { ...organisation.transactionFields, [fieldName.toLowerCase().split(' ').join('_')]: {
                        fieldDesc,
                        fieldName,
                        subfields: {}
                    } } });
    
                    setCategory(fieldName.toLowerCase().split(' ').join('_'));
                    onCancel?.();
                }
                return;
            }

            if (updateType === ETransactionFieldsUpdateType.ADD_SUBFIELD && subfields) {
                const { data } = (await addNewCategory({ 
                    address: user.address,
                    signature: user.signature,
                    organisationId: organisation.id,
                    transactionFields: {
                        ...transactionFields,
                        [category]: {
                            ...transactionFields[category],
                            subfields: {
                                ...transactionFields[category].subfields,
                                ...subfields
                            }
                        }
                    }
                }
                )) as { data: string };
                if (data && data === 'success') {
                    setLoading(false);
                    queueNotification({
                        header: 'Success!',
                        message: 'Transaction Fields Updated.',
                        status: NotificationStatus.SUCCESS
                    });
                    setOrganisation({ 
                        ...organisation,
                        transactionFields: {
							...organisation.transactionFields,
							[category]: {
								...organisation.transactionFields[category],
								subfields: {
									...organisation.transactionFields[category].subfields,
									...subfields
								}
							}
						} });
                    onCancel?.();
                }
                return;
            }

            if (updateType === ETransactionFieldsUpdateType.DELETE_SUBFIELD && subfields) {
                const { data } = (await addNewCategory({ 
                    address: user.address,
                    signature: user.signature,
                    organisationId: organisation.id,
                    transactionFields: {
                        ...transactionFields,
                        [category]: {
                            ...transactionFields[category],
                            subfields
                        }
                    }
                }
                )) as { data: string };
                if (data && data === 'success') {
                    setLoading(false);
                    queueNotification({
                        header: 'Success!',
                        message: 'Transaction Fields Updated.',
                        status: NotificationStatus.SUCCESS
                    });
                    setOrganisation({ 
                        ...organisation,
                        transactionFields: {
							...organisation.transactionFields,
							[category]: {
								...organisation.transactionFields[category],
								subfields
							}
						} });
                    onCancel?.();
                }
                return;
            }

		} catch (error) {
			console.log('ERROR', error);
			queueNotification({
				header: 'Failed!',
				message: 'Error in Updating Transaction Fields.',
				status: NotificationStatus.ERROR
			});
			setLoading(false);
		}
	};
  return (
    <TransactionFields onSave={handleSave} category={category} setCategory={setCategory} loading={loading} transactionFields={transactionFields} />
  )
}

export default TransactionFieldsSubstrate;