import { Derivable, Node, read, Show } from "@rbxts/vide";
import { Gradient } from "../utils/gradient";
import Vide from "@rbxts/vide";
import { destroyCleanUp } from "../utils/destroyCleanUp";

export interface ImageProps {
	imageId?: Derivable<string>;
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
	rectOffset?: Derivable<Vector2>;
	rectSize?: Derivable<Vector2>;
	sliceCenter?: Derivable<Rect>;
	sliceScale?: Derivable<number>;
	scaleType?: Derivable<Enum.ScaleType>;
	rotation?: Derivable<number>;
	gradientRotation?: Derivable<number>;
}

const defaultColorSequence = new ColorSequence(new Color3(1, 1, 1));
const defaultNumberSequence = new NumberSequence(0);

export function Image({
	active,
	anchorPoint,
	children,
	clipsDescendants,
	color,
	gradientRotation,
	layoutOrder,
	rectOffset,
	rectSize,
	sliceCenter,
	imageId,
	sliceScale,
	position,
	rotation,
	scaleType,
	size,
	transparency,
	visible,
	zIndex,
}: ImageProps) {
	return (
		<imagelabel
			Image={imageId}
			SliceCenter={sliceCenter}
			SliceScale={sliceScale}
			Rotation={rotation}
			ImageRectOffset={rectOffset}
			ImageRectSize={rectSize}
			Active={active}
			ClipsDescendants={clipsDescendants}
			ImageColor3={() => {
				const val = read(color);
				if (typeIs(val, "Color3")) return val;
				return new Color3(1, 1, 1);
			}}
			ImageTransparency={() => {
				const val = read(transparency);
				if (typeIs(val, "number")) return val;
				return 0;
			}}
			BackgroundTransparency={1}
			ScaleType={() => read(scaleType) ?? "Fit"}
			Size={() => read(size) ?? UDim2.fromOffset(100, 100)}
			Visible={visible}
			Position={() => read(position) ?? UDim2.fromScale(0.5, 0.5)}
			AnchorPoint={() => read(anchorPoint) ?? new Vector2(0.5, 0.5)}
			ZIndex={zIndex}
			LayoutOrder={layoutOrder}
		>
			{children}
			<Show when={() => typeIs(read(transparency), "table") || typeIs(read(color), "table")}>
				{() => (
					<uigradient
						Rotation={gradientRotation}
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
		</imagelabel>
	);
}
