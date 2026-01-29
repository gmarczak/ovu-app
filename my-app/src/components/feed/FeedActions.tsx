import { Button } from "../ui/Button";

type LogActionsProps = {
	onStart?: () => void;
	onEnd?: () => void;
};

export const LogActions = ({ onStart, onEnd }: LogActionsProps) => {
	return (
		<div className="flex items-center gap-3">
			<Button variant="secondary" size="md" onClick={onStart}>
				Log period start
			</Button>
			<Button variant="ghost" size="md" onClick={onEnd}>
				Log period end
			</Button>
		</div>
	);
};
