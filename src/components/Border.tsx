import { action, Derivable, Node } from "@rbxts/vide";
import { Gradient } from "../utils/gradient";
import { borderDataBase } from "../data/borderDataBase";
import { produce } from "@rbxts/immut";

export interface BorderProps {
	thickness?: Derivable<UDim>;
	color?: Derivable<Color3 | Gradient<Color3>>;
	offset?: Derivable<UDim2>;
	transparency?: Derivable<number | Gradient<number>>;
	zIndex?: Derivable<number>;
	gradientRotation?: Derivable<number>;
	gradientOffset?: Derivable<Vector2>;
}

let id = 0;
export function Border(props: BorderProps) {
	return action((instance) => {
		if (!instance.IsA("Frame")) return;
		const currentId = id;
		borderDataBase((state) =>
			produce(state, (draft) => {
				const instanceBorders = draft.get(instance);
				if (!instanceBorders) draft.set(instance, new Map());
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				draft.get(instance)?.set(currentId, props as any); // Type instantiation is excessively deep and possibly infinite
				return draft;
			}),
		);
		instance.Destroying.Connect(() => {
			borderDataBase((state) =>
				produce(state, (draft) => {
					draft.get(instance)?.delete(currentId);
					return draft;
				}),
			);
		});
		id++;
	});
}
