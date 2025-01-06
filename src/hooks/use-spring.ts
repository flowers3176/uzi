import { MotionGoal, PartialMotionGoal, SpringOptions } from "@rbxts/ripple";
import { RunService } from "@rbxts/services";
import { cleanup, Derivable, read } from "@rbxts/vide";

import { useMotion } from "./use-motion";

export function useSpring<T extends MotionGoal>(goal: Derivable<T>, options?: SpringOptions) {
	const [value, motion] = useMotion(read(goal));
	let prevGoal = read(goal);

	const connection = RunService.Heartbeat.Connect(() => {
		const currentGoal = read(goal);
		if (currentGoal !== prevGoal) {
			prevGoal = currentGoal;
			motion.spring(currentGoal as PartialMotionGoal<T>, options);
		}
	});

	cleanup(() => connection);

	return value;
}
