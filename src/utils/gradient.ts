import { createMotion, Motion, PartialMotionGoal, SpringOptions } from "@rbxts/ripple";
import { source, Source } from "@rbxts/vide";

type GradientInput<T> = T | [time: number, value: T];
type PrimativeInput<T> = T extends Color3 ? Color3 : number;
export class Gradient<T extends number | Color3, B extends GradientInput<T> = GradientInput<T>> {
	private timeMotions: Motion<number>[] = [];
	private valueMotions: Motion<T>[] = [];
	private privateSequence: Source<
		T extends Color3 | number
			? PrimativeInput<B> extends number
				? NumberSequence
				: ColorSequence
			: T extends Color3
				? ColorSequence
				: NumberSequence
	>;
	sequence: () => T extends Color3 | number
		? PrimativeInput<B> extends number
			? NumberSequence
			: ColorSequence
		: T extends Color3
			? ColorSequence
			: NumberSequence = () => this.privateSequence();
	constructor(input: B[]) {
		this.setupMotion(this.formatInput(input));
		this.privateSequence = source(this.calcuclateSequence());
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
				motion.onStep(() => this.updateSequence());
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
				motion.onStep(() => this.updateSequence());
				return;
			} else {
				existingMotion.spring(val as PartialMotionGoal<T>);
			}
		});
	}
	private calcuclateSequence() {
		type Keypoint = T extends Color3 ? ColorSequenceKeypoint : NumberSequenceKeypoint;
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
					: new ColorSequenceKeypoint(v, value as Color3)) as Keypoint,
			);

			if (i + 1 === arr.size() && v !== 1) {
				seqeuences.push(
					(isNumberSequence
						? new NumberSequenceKeypoint(1, value as number)
						: new ColorSequenceKeypoint(1, value as Color3)) as Keypoint,
				);
			}
		});
		return (isNumberSequence
			? new NumberSequence(seqeuences as NumberSequenceKeypoint[])
			: new ColorSequence(seqeuences as ColorSequenceKeypoint[])) as unknown as T extends Color3 | number
			? PrimativeInput<B> extends number
				? NumberSequence
				: ColorSequence
			: T extends Color3
				? ColorSequence
				: NumberSequence;
	}

	private formatInput(input: B[]) {
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
		this.privateSequence(this.calcuclateSequence());
	}

	spring(input: PrimativeInput<B>[], springOptions?: SpringOptions) {
		const formated = this.formatInput(input as B[]);
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
				motion.onStep(() => this.updateSequence());
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

	set(input: PrimativeInput<B>[]) {
		const formated = this.formatInput(input as B[]);
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
				motion.onStep(() => this.updateSequence());
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
		this.timeMotions.forEach((v) => {
			v.destroy();
		});
		this.valueMotions.forEach((v) => {
			v.destroy();
		});
	}
}
