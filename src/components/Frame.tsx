import { action, Derivable, For, Node, read, Show, source } from "@rbxts/vide";
import { BaseFrame } from "./BaseFrame";
import { Gradient } from "../utils/gradient";
import Vide from "@rbxts/vide";
import { useAtom } from "@rbxts/vide-charm";
import { borderDataBase } from "../data/borderDataBase";
import { BorderProps } from "./Border";
import { destroyCleanUp } from "../utils/destroyCleanUp";

export interface FrameProps {
	name?: Derivable<string>;
	size?: Derivable<UDim2>;
	position?: Derivable<UDim2>;
	anchorPoint?: Derivable<Vector2>;
	color?: Derivable<Color3 | Gradient<Color3>>;
	transparency?: Derivable<number | Gradient<number>>;
	active?: Derivable<boolean>;
	clipsDescendants?: Derivable<boolean>;
	visible?: Derivable<boolean>;
	zIndex?: Derivable<number>;
	layoutOrder?: Derivable<number>;
	children?: Node;
	rotation?: Derivable<number>;
	gradientRotation?: Derivable<number>;
	gradientOffset?: Derivable<Vector2>;
}

const defaultColorSequence = new ColorSequence(new Color3(1, 1, 1));
const defaultNumberSequence = new NumberSequence(0);

export function Frame(props: FrameProps) {
	const {
		active,
		children,
		clipsDescendants,
		visible,
		color,
		rotation,
		layoutOrder,
		name,
		position,
		zIndex,
		size,
		anchorPoint,
		transparency,
		gradientRotation,
		gradientOffset,
	} = props;
	const borderDataBaseSRC = useAtom(borderDataBase);
	const frameRef = source<Frame>();
	const frameBorders: () => BorderProps[] = () => {
		const frameRefVal = frameRef();
		const borderDataVal = borderDataBaseSRC();
		if (frameRefVal === undefined) return [];
		const frameBordersUnFormatted = borderDataVal.get(frameRefVal);
		if (!frameBordersUnFormatted) return [];
		const arrFormat: BorderProps[] = [];
		frameBordersUnFormatted.forEach((v) => arrFormat.push(v));
		return arrFormat;
	};
	return (
		<BaseFrame
			name={name}
			active={active}
			transparency={1}
			position={position}
			size={size}
			layoutOrder={layoutOrder}
			zIndex={zIndex}
			anchorPoint={anchorPoint}
		>
			<BaseFrame
				name={"Body"}
				rotation={rotation}
				active={active}
				clipsDescendants={clipsDescendants}
				color={() => {
					const val = read(color);
					if (typeIs(val, "Color3")) return val;
				}}
				transparency={() => {
					const val = read(transparency);
					if (typeIs(val, "number")) return val;
				}}
				size={UDim2.fromScale(1, 1)}
				visible={visible}
			>
				{action((instance) => {
					frameRef(instance);
				})}
				<Show when={() => typeIs(read(transparency), "table") || typeIs(read(color), "table")}>
					{() => (
						<uigradient
							Rotation={gradientRotation}
							Offset={gradientOffset}
							action={destroyCleanUp}
							Color={() => {
								const val = read(color);
								if (!typeIs(val, "Color3")) return val?.sequence() ?? defaultColorSequence;
								return defaultColorSequence;
							}}
							Transparency={() => {
								const val = read(transparency);
								if (!typeIs(val, "number")) return val?.sequence() ?? defaultNumberSequence;
								return defaultNumberSequence;
							}}
						/>
					)}
				</Show>
				{children}
			</BaseFrame>
			<BaseFrame size={UDim2.fromScale(1, 1)} transparency={1} zIndex={-1} name={"BorderContainers"}>
				<For each={frameBorders}>
					{({ color, offset, thickness, transparency, zIndex, gradientRotation, gradientOffset }) => (
						<Frame
							color={color}
							rotation={rotation}
							gradientOffset={gradientOffset}
							gradientRotation={gradientRotation}
							anchorPoint={new Vector2(0.5, 0.5)}
							transparency={transparency}
							zIndex={zIndex}
							size={() => {
								const thicknessVal = read(thickness);
								const scale = (thicknessVal?.Scale ?? 0) * 2;
								const offset = (thicknessVal?.Offset ?? 0) * 2;
								return UDim2.fromScale(1, 1).add(new UDim2(scale, offset, scale, offset));
							}}
							position={() => UDim2.fromScale(0.5, 0.5).add(read(offset) ?? UDim2.fromOffset())}
						>
							{action((border) => {
								const frame = frameRef();
								function processUICorner(uiCorner: UICorner) {
									const copyCorner = new Instance("UICorner");
									copyCorner.CornerRadius = uiCorner.CornerRadius;
									copyCorner.Parent = border;
									const connection = uiCorner
										.GetPropertyChangedSignal("CornerRadius")
										.Connect(() => (copyCorner.CornerRadius = uiCorner.CornerRadius));

									const connection2 = uiCorner.AncestryChanged.Connect(() => {
										if (!frame) return copyCorner.Destroy();
										if (!uiCorner.IsDescendantOf(frame)) {
											copyCorner.Destroy();
											connection.Disconnect();
											connection2.Disconnect();
										}
									});
								}
								const existing = frame?.FindFirstChildOfClass("UICorner");
								frame?.ChildAdded.Connect((child) => {
									if (!child.IsA("UICorner")) return;
									processUICorner(child);
								});
								if (existing) processUICorner(existing);
							})}
						</Frame>
					)}
				</For>
			</BaseFrame>
			{action((baseFrame) => {
				const frame = frameRef();
				function processUIRatio(uiRatio: UIAspectRatioConstraint) {
					const copyRatio = new Instance("UIAspectRatioConstraint");
					copyRatio.AspectRatio = uiRatio.AspectRatio;
					copyRatio.Parent = baseFrame;
					const connection = uiRatio
						.GetPropertyChangedSignal("AspectRatio")
						.Connect(() => (copyRatio.AspectRatio = uiRatio.AspectRatio));

					const connection2 = uiRatio.AncestryChanged.Connect(() => {
						if (!frame) return copyRatio.Destroy();
						if (!uiRatio.IsDescendantOf(frame)) {
							copyRatio.Destroy();
							connection.Disconnect();
							connection2.Disconnect();
						}
					});
				}
				const existing = frame?.FindFirstChildOfClass("UIAspectRatioConstraint");
				frame?.ChildAdded.Connect((child) => {
					if (!child.IsA("UIAspectRatioConstraint")) return;
					processUIRatio(child);
				});
				if (existing) processUIRatio(existing);
			})}
		</BaseFrame>
	);
}
