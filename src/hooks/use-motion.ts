import { createMotion, MotionGoal } from "@rbxts/ripple";
import { RunService } from "@rbxts/services";
import { cleanup, source } from "@rbxts/vide";

export function useMotion<T extends MotionGoal>(initalValue: T) {
	const motion = createMotion(initalValue);
	cleanup(() => motion.destroy());
	const valueSource = source(initalValue);

	const connection = RunService.Heartbeat.Connect((delta) => {
		const value = motion.step(delta);

		if (value !== valueSource()) {
			valueSource(value);
		}
	});

	cleanup(() => connection.Disconnect());

	return $tuple(valueSource, motion);
}
