import { action, cleanup, Derivable, For, Node, read, Show, source } from "@rbxts/vide";
import { BaseFrame, BaseFrameProps } from "./BaseFrame";
import { Gradient } from "../utils/gradient";
import Vide from "@rbxts/vide";
import { useAtom } from "@rbxts/vide-charm";
import { borderDataBase } from "../data/borderDataBase";
import { BorderProps } from "./Border";

export interface FrameProps {
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
}

const defaultColorSequence = new ColorSequence(new Color3(1, 1, 1));
const defaultNumberSequence = new NumberSequence(0);

export function Frame<T extends FrameProps, G>(props: FrameProps) {
	const {
		active,
		children,
		clipsDescendants,
		visible,
		color,
		rotation,
		layoutOrder,
		position,
		zIndex,
		size,
		anchorPoint,
		transparency,
		gradientRotation,
	} = props;
	const borderDataBaseSRC = useAtom(borderDataBase);
	const frameRef = source<Frame>();
	const frameBorders: () => BorderProps[] = () => {
		const frameRefVal = frameRef();
		const borderDataVal = borderDataBaseSRC();
		if (frameRefVal === undefined) return [];
		const frameBordersUnformated = borderDataVal.get(frameRefVal);
		if (!frameBordersUnformated) return [];
		const arrFormat: BorderProps[] = [];
		frameBordersUnformated.forEach((v) => arrFormat.push(v));
		return arrFormat;
	};
	return (
		<BaseFrame
			active={active}
			transparency={1}
			position={position}
			size={size}
			layoutOrder={layoutOrder}
			zIndex={zIndex}
			anchorPoint={anchorPoint}
		>
			<BaseFrame
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
							action={cleanup}
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
						>
							{action(cleanup)}
						</uigradient>
					)}
				</Show>
				{children}
			</BaseFrame>
			<BaseFrame size={UDim2.fromScale(1, 1)} transparency={1} zIndex={-1}>
				<For each={frameBorders}>
					{({ color, offset, thickness, transparency, zIndex }) => (
						<Frame
							color={color}
							rotation={rotation}
							anchorPoint={new Vector2(0.5, 0.5)}
							transparency={transparency}
							zIndex={zIndex}
							size={() => {
								const ticknessVal = read(thickness);
								const scale = (ticknessVal?.Scale ?? 0) * 2;
								const offset = (ticknessVal?.Offset ?? 0) * 2;
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
		</BaseFrame>
	);
}
