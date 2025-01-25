import { Darken, Lighten } from "@rbxts/colour-utils";
import Signal, { Connection } from "@rbxts/lemon-signal";
import { createMotion, Motion, PartialMotionGoal, SpringOptions } from "@rbxts/ripple";
import { RunService } from "@rbxts/services";
import { cleanup, source, Source, untrack } from "@rbxts/vide";
import { deepEqual } from "./deep-equal";

type GradientInput<T> = T | [time: number, value: T];
const updateSignal = new Signal();
if (RunService.IsServer()) {
	const connection = RunService.Heartbeat.Connect(() => updateSignal.Fire());
	pcall(cleanup, connection);
	pcall(cleanup, updateSignal);
} else {
	const connection = RunService.RenderStepped.Connect(() => updateSignal.Fire());
	pcall(cleanup, connection);
	pcall(cleanup, updateSignal);
}
export class Gradient<T extends number | Color3> {
	protected timeMotions: Motion<number>[] = [];
	protected valueMotions: Motion<T>[] = [];
	private privateSequence: Source<T extends Color3 ? ColorSequence : NumberSequence>;
	private connection: Connection;
	sequence = (): T extends Color3 ? ColorSequence : NumberSequence => this.privateSequence();
	constructor(input: GradientInput<T>[]) {
		pcall(cleanup, () => this.destroy());
		this.setupMotion(this.formatInput(input));
		this.privateSequence = source(this.calcuclateSequence());
		this.connection = updateSignal.Connect(() => this.updateSequence());
	}

	protected lightness = 0;
	protected darkness = 0;
	applyLightness(percentage: number) {
		if (!typeIs(this.valueMotions[0].get(), "Color3")) error("Apply lightness can only be used on color gradients");
		const newGradient = new Gradient([new Color3(), new Color3()]);
		newGradient.lightness = percentage;
		newGradient.timeMotions = (this as Gradient<Color3>).timeMotions;
		newGradient.valueMotions = (this as Gradient<Color3>).valueMotions;
		newGradient.updateSequence();
		return newGradient;
	}

	applyDarkness(percentage: number) {
		if (!typeIs(this.valueMotions[0].get(), "Color3")) error("Apply darkness can only be used on color gradients");
		const newGradient = new Gradient([new Color3(), new Color3()]);
		newGradient.darkness = percentage;
		newGradient.timeMotions = (this as Gradient<Color3>).timeMotions;
		newGradient.valueMotions = (this as Gradient<Color3>).valueMotions;
		newGradient.updateSequence();
		return newGradient;
	}

	detach() {
		this.timeMotions = [...this.timeMotions];
		this.valueMotions = [...this.valueMotions];
		return this;
	}

	private setupMotion(formatedInput: [time: number, value: T][]) {
		const timeOnly = formatedInput.map((v) => v[0]);
		const valueOnly = formatedInput.map((v) => v[1]);
		timeOnly.forEach((val, i) => {
			const existingMotion = this.timeMotions[i];
			if (!existingMotion) {
				const motion = createMotion(val);
				motion.start();
				this.timeMotions[i] = motion;
				return;
			} else {
				existingMotion.spring(val);
			}
		});
		valueOnly.forEach((val, i) => {
			const existingMotion = this.valueMotions[i];
			if (!existingMotion) {
				const motion = createMotion(val);
				motion.start();
				this.valueMotions[i] = motion;
				return;
			} else {
				existingMotion.spring(val as PartialMotionGoal<T>);
			}
		});
	}
	private calcuclateSequence() {
		type Keypoint = T extends Color3 ? ColorSequenceKeypoint : NumberSequenceKeypoint;
		const applyLightAndDark = (color: Color3) => {
			return Lighten(Darken(color, this.darkness), this.lightness);
		};
		const isNumberSequence = typeIs(this.valueMotions[0].get(), "number");
		const seqeuences: Keypoint[] = [];
		const sortedValueMotions = this.valueMotions.sort((a, b) => {
			const aI = this.valueMotions.findIndex((v) => v === a);
			const bI = this.valueMotions.findIndex((v) => v === b);
			const aT = this.timeMotions[aI];
			const bT = this.timeMotions[bI];
			return aT.get() < bT.get();
		});
		const sortedTimeMotions = this.timeMotions.sort((a, b) => a.get() < b.get());
		sortedTimeMotions.forEach((_v, i, arr) => {
			const v = _v.get();
			const value = sortedValueMotions[i].get();
			seqeuences.push(
				(isNumberSequence
					? new NumberSequenceKeypoint(v, value as number)
					: new ColorSequenceKeypoint(v, applyLightAndDark(value as Color3))) as Keypoint,
			);

			if (i + 1 === arr.size() && v !== 1) {
				seqeuences.push(
					(isNumberSequence
						? new NumberSequenceKeypoint(1, value as number)
						: new ColorSequenceKeypoint(1, applyLightAndDark(value as Color3))) as Keypoint,
				);
			}
		});
		return (
			isNumberSequence
				? new NumberSequence(seqeuences as NumberSequenceKeypoint[])
				: new ColorSequence(seqeuences as ColorSequenceKeypoint[])
		) as T extends Color3 ? ColorSequence : NumberSequence;
	}

	private formatInput(input: GradientInput<T>[]) {
		const size = input.size();
		const per = 1 / (size - 1);
		const nonSpecificTime = !typeIs(input[0], "table");
		let formated: [time: number, value: T][] = [];
		if (size === 1) {
			if (nonSpecificTime) {
				const val = (input as T[])[0];
				formated.push([0, val]);
				formated.push([1, val]);
			} else {
				const val = (input as [time: number, value: T][])[0][1];
				formated.push([0, val]);
				formated.push([1, val]);
			}
		} else {
			if (nonSpecificTime) {
				input.forEach((value, number) => {
					formated.push([number * per, value as T]);
				});
			} else {
				formated = (input as [time: number, value: T][]).sort((a, b) => a[0] > b[0]);
			}
		}
		return formated;
	}

	private updateSequence() {
		untrack(() => {
			if (!this.privateSequence) return;
			const old = this.privateSequence();
			const result = this.calcuclateSequence();
			if (deepEqual(old.Keypoints, result.Keypoints)) return;
			this.privateSequence(result);
		});
	}

	spring(input: T[], springOptions?: SpringOptions) {
		const formated = this.formatInput(input as GradientInput<T>[]);
		const timeOnly = formated.map((v) => v[0]);
		const valueOnly = formated.map((v) => v[1]);

		const timeOnlySize = timeOnly.size();
		this.timeMotions = this.timeMotions.map((v, i) =>
			i < timeOnlySize
				? v
				: (() => {
						v.destroy();
						return undefined;
					})(),
		) as Motion<number>[];

		timeOnly.forEach((val, i) => {
			const existingMotion = this.timeMotions[i];
			if (!existingMotion) {
				const motion = createMotion(val);
				motion.start();
				this.timeMotions[i] = motion;
				return;
			} else {
				existingMotion.spring(val);
			}
		});

		const valueOnlySize = valueOnly.size();
		this.valueMotions = this.valueMotions.map((v, i) =>
			i < valueOnlySize
				? v
				: (() => {
						v.destroy();
						return undefined;
					})(),
		) as Motion<T>[];
		valueOnly.forEach((val, i) => {
			const existingMotion = this.valueMotions[i];
			if (!existingMotion) {
				const motion = createMotion(val);
				motion.start();
				this.valueMotions[i] = motion;
				return;
			} else {
				existingMotion.spring(val as PartialMotionGoal<T>, springOptions);
			}
		});
	}

	set(input: T[]) {
		const formated = this.formatInput(input as GradientInput<T>[]);
		const timeOnly = formated.map((v) => v[0]);
		const valueOnly = formated.map((v) => v[1]);

		const timeOnlySize = timeOnly.size();
		this.timeMotions = this.timeMotions.map((v, i) =>
			i < timeOnlySize
				? v
				: (() => {
						v.destroy();
						return undefined;
					})(),
		) as Motion<number>[];

		timeOnly.forEach((val, i) => {
			const existingMotion = this.timeMotions[i];
			if (!existingMotion) {
				const motion = createMotion(val);
				motion.start();
				this.timeMotions[i] = motion;
				return;
			} else {
				existingMotion.set(val);
			}
		});

		const valueOnlySize = valueOnly.size();
		this.valueMotions = this.valueMotions.map((v, i) =>
			i < valueOnlySize
				? v
				: (() => {
						v.destroy();
						return undefined;
					})(),
		) as Motion<T>[];
		valueOnly.forEach((val, i) => {
			const existingMotion = this.valueMotions[i];
			if (!existingMotion) {
				const motion = createMotion(val);
				motion.start();
				this.valueMotions[i] = motion;
				return;
			} else {
				existingMotion.set(val as PartialMotionGoal<T>);
			}
		});
	}

	destroy() {
		this.timeMotions?.forEach((v) => {
			v?.destroy();
		});
		this.valueMotions?.forEach((v) => {
			v?.destroy();
		});
		this.connection?.Disconnect();
	}
}
