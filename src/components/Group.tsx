import { Derivable, Node } from "@rbxts/vide";
import { Frame } from "./Frame";
import Vide from "@rbxts/vide";

interface GroupProps {
	size?: Derivable<UDim2>;
	name?: Derivable<string>;
	automaticSize?: Derivable<Enum.AutomaticSize["Name"] | Enum.AutomaticSize>;
	position?: Derivable<UDim2>;
	anchorPoint?: Derivable<Vector2>;
	rotation?: Derivable<number>;
	clipsDescendants?: Derivable<boolean>;
	layoutOrder?: Derivable<number>;
	visible?: Derivable<boolean>;
	zIndex?: Derivable<number>;
	children?: Node;
}

export function Group(props: GroupProps) {
	return (
		<Frame
			size={UDim2.fromScale(1, 1)}
			transparency={1}
			active={false}
			position={UDim2.fromScale(0.5, 0.5)}
			anchorPoint={new Vector2(0.5, 0.5)}
			{...props}
		/>
	);
}
