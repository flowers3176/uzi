import { Derivable, derive, Node, read, Show } from "@rbxts/vide";
import { Gradient } from "../utils/gradient";
import Vide from "@rbxts/vide";
import { destroyCleanUp } from "../utils/destroyCleanUp";

export interface ImageProps {
	imageId?: Derivable<string>;
	size?: Derivable<UDim2>;
	automaticSize?: Derivable<Enum.AutomaticSize["Name"] | Enum.AutomaticSize>;
	position?: Derivable<UDim2>;
	anchorPoint?: Derivable<Vector2>;
	color?: Derivable<Color3 | Gradient<Color3>>;
	transparency?: Derivable<number | Gradient<number>>;
	active?: Derivable<boolean>;
	clipsDescendants?: Derivable<boolean>;
	interactable?: Derivable<boolean>;
	visible?: Derivable<boolean>;
	zIndex?: Derivable<number>;
	layoutOrder?: Derivable<number>;
	children?: Node;
	rectOffset?: Derivable<Vector2>;
	rectSize?: Derivable<Vector2>;
	sliceCenter?: Derivable<Rect>;
	sliceScale?: Derivable<number>;
	scaleType?: Derivable<
		| Enum.ScaleType.Stretch
		| Enum.ScaleType.Slice
		| Enum.ScaleType.Tile
		| Enum.ScaleType.Fit
		| Enum.ScaleType.Crop
		| "Stretch"
		| "Slice"
		| "Tile"
		| "Fit"
		| "Crop"
	>;
	tileSize?: Derivable<UDim2>;
	rotation?: Derivable<number>;
	gradientRotation?: Derivable<number>;
	gradientOffset?: Derivable<Vector2>;
}

const defaultColorSequence = new ColorSequence(new Color3(1, 1, 1));
const defaultNumberSequence = new NumberSequence(0);

export function Image({
	active,
	anchorPoint,
	children,
	clipsDescendants,
	automaticSize,
	interactable,
	color,
	gradientRotation,
	gradientOffset,
	layoutOrder,
	rectOffset,
	rectSize,
	sliceCenter,
	imageId,
	tileSize,
	sliceScale,
	position,
	rotation,
	scaleType,
	size,
	transparency,
	visible,
	zIndex,
}: ImageProps) {
	const getTransparency = derive(() => {
		const val = read(transparency);
		if (typeIs(val, "number")) return val;
		return 0;
	});
	const isActive = derive(() => read(active) ?? getTransparency() !== 1);
	return (
		<imagelabel
			Interactable={interactable}
			Image={imageId}
			SliceCenter={sliceCenter}
			SliceScale={sliceScale}
			Rotation={rotation}
			ImageRectOffset={rectOffset}
			ImageRectSize={rectSize}
			Active={isActive}
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
			TileSize={tileSize}
			ScaleType={() => read(scaleType) ?? "Fit"}
			Size={() => read(size) ?? UDim2.fromOffset(100, 100)}
			Visible={visible}
			Position={() => read(position) ?? UDim2.fromScale(0.5, 0.5)}
			AnchorPoint={() => read(anchorPoint) ?? new Vector2(0.5, 0.5)}
			ZIndex={zIndex}
			AutomaticSize={automaticSize}
			LayoutOrder={layoutOrder}
		>
			{children}
			<Show when={() => typeIs(read(transparency), "table") || typeIs(read(color), "table")}>
				{() => (
					<uigradient
						Offset={gradientOffset}
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
