import Vide, { action, cleanup, Derivable, effect, read, Show, source } from "@rbxts/vide";
import { Gradient } from "../utils/gradient";
import { destroyCleanUp } from "../utils/destroyCleanUp";

interface TransitionProps {
	groupColor?: Derivable<Color3>;
	groupTransparency?: Derivable<number | Gradient<number>>;
	clipsDescendants?: boolean;
	anchor?: Derivable<Vector2>;
	position?: Derivable<UDim2>;
	active?: Derivable<boolean>;
	size?: Derivable<UDim2>;
	rotation?: Derivable<number>;
	zIndex?: Derivable<number>;
	automaticSize?: Derivable<Enum.AutomaticSize["Name"] | Enum.AutomaticSize>;
	layoutOrder?: Derivable<number>;
	events?: Vide.InstanceEventAttributes<Frame>;
	children?: Vide.Node;
	gradientRotation?: Derivable<number>;
	gradientOffset?: Derivable<Vector2>;
	before?: () => Vide.Node;
}

const defaultNumberSequence = new NumberSequence(0);

export function Transition(props: TransitionProps) {
	const frameRef = source<Frame>();
	const canvasGroupRef = source<CanvasGroup>();

	const transitioning = () => {
		const color = read(props.groupColor) || new Color3(1, 1, 1);
		const transparency = read(props.groupTransparency) ?? 0;

		return !typeIs(transparency, "number") || transparency > 0 || color !== new Color3(1, 1, 1);
	};

	<frame
		BackgroundTransparency={1}
		Active={props.active}
		AutomaticSize={props.automaticSize}
		Size={new UDim2(1, 0, 1, 0)}
		Parent={() => (transitioning() ? canvasGroupRef() : frameRef())}
	>
		{props.children}
	</frame>;

	// Set the canvas group transparency near 1 when the transition is complete
	// to avoid a flicker caused by the texture taking a frame to unload
	effect(() => {
		const transition = transitioning();
		const canvasGroup = canvasGroupRef();

		if (!transition && canvasGroup) {
			canvasGroup.GroupTransparency = 0.99;
		}
	});

	return (
		<frame
			AutomaticSize={props.automaticSize}
			action={frameRef}
			Name="Transition"
			BackgroundTransparency={1}
			AnchorPoint={props.anchor}
			Size={props.size || new UDim2(1, 0, 1, 0)}
			Position={props.position}
			Rotation={props.rotation}
			LayoutOrder={props.layoutOrder}
			ZIndex={props.zIndex}
			Active={props.active}
			ClipsDescendants={props.clipsDescendants ?? true}
			{...props.events}
		>
			{action((v: Frame) => {
				cleanup(v);
			})}
			{props.before?.()}

			<canvasgroup
				Active={props.active}
				action={canvasGroupRef}
				GroupTransparency={() => {
					const val = read(props.groupTransparency);
					if (typeIs(val, "number")) return val;
					return 0;
				}}
				GroupColor3={props.groupColor}
				BackgroundTransparency={1}
				AutomaticSize={props.automaticSize}
				Size={new UDim2(1, 0, 1, 0)}
			>
				<Show when={() => typeIs(read(props.groupTransparency), "table")}>
					{() => (
						<uigradient
							Rotation={props.gradientRotation}
							action={destroyCleanUp}
							Transparency={() => {
								const val = read(props.groupTransparency);
								if (!typeIs(val, "number")) return val?.sequence() ?? defaultNumberSequence;
								return defaultNumberSequence;
							}}
						/>
					)}
				</Show>
				{props.before?.()}
			</canvasgroup>
		</frame>
	);
}
