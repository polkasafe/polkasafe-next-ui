import { UserPlusIcon } from '@common/global-ui-components/Icons';
import { ScaleMotion } from '@common/global-ui-components/Motion/Scale';

const styles = {
	section: 'mt-auto',
	button: 'text-text_main bg-primary p-3 rounded-lg w-full flex items-center justify-center gap-x-2 cursor-pointer',
	span: 'font-medium text-sm',
	userIcon: 'text-sm'
};

function AddMultisig() {
	return (
		<section className={styles.section}>
			<ScaleMotion scale={1.05}>
				<button className={styles.button}>
					<UserPlusIcon className={styles.userIcon} />
					<span className={styles.span}>Add Multisig</span>
				</button>
			</ScaleMotion>
		</section>
	);
}

export default AddMultisig;
