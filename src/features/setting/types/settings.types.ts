export type ProfileCardProps = {
	profilePhotoUrl?: string;
	fullName?: string;
	referenceId?: string;
	status?: string;
	onPress?: () => void;
};

export type SettingsItemProps = {
	icon: string;
	label: string;
	value?: string | number;
	onPress?: () => void;
	rightComponent?: React.ReactNode;
};
