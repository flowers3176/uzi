import Vide, { cleanup, Derivable, Node, read } from "@rbxts/vide";

export interface BaseFrameProps {
	size?: Derivable<UDim2 | undefined>;
	position?: Derivable<UDim2 | undefined>;
	color?: Derivable<Color3 | undefined>;
	anchorPoint?: Derivable<Vector2 | undefined>;
	transparency?: Derivable<number | undefined>;
	active?: Derivable<boolean | undefined>;
	layoutOrder?: Derivable<number>;
	rotation?: Derivable<number | undefined>;
	clipsDescendants?: Derivable<boolean | undefined>;
	visible?: Derivable<boolean | undefined>;
	zIndex?: Derivable<number | undefined>;
	children?: Node;
}

function defaultValueDerivable<T, V extends Derivable<T | undefined> = Derivable<T>>(v: V, defaultValue: T): () => T {
	return () => (read(v) ?? defaultValue) as T;
}

/**
 * A Frame component for internal usage
 */
export function BaseFrame({
	active,
	color,
	position,
	visible,
	size,
	zIndex,
	transparency,
	layoutOrder,
	rotation,
	children,
	anchorPoint,
}: BaseFrameProps) {
	return (
		<frame
			Active={defaultValueDerivable(active, true)}
			BackgroundColor3={defaultValueDerivable(color, new Color3(1, 1, 1))}
			Position={defaultValueDerivable(position, UDim2.fromScale(0.5, 0.5))}
			Size={defaultValueDerivable(size, UDim2.fromOffset(100, 100))}
			Transparency={defaultValueDerivable(transparency, 0)}
			Visible={defaultValueDerivable(visible, true)}
			ZIndex={defaultValueDerivable(zIndex, 1)}
			AnchorPoint={defaultValueDerivable(anchorPoint, new Vector2(0.5, 0.5))}
			Rotation={defaultValueDerivable(rotation, 0)}
			LayoutOrder={layoutOrder}
			action={cleanup}
		>
			{children}
		</frame>
	);
}
