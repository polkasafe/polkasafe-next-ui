import PolkasafeLogo from '@common/assets/icons/polkasafe.svg';
import styles from './SplashScreen.module.scss';

export const SplashScreen = () => {
	return (
		<div className={styles.container}>
			<div className={styles.image}>
				<PolkasafeLogo />
			</div>
		</div>
	);
};
