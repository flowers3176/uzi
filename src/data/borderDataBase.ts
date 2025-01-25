import { Derivable } from "@rbxts/vide";
import { Gradient } from "../utils/gradient";
import { atom } from "@rbxts/charm";

type BorderDataBase = ReadonlyMap<
	Instance,
	ReadonlyMap<
		number,
		{
			thickness?: Derivable<UDim>;
			color?: Derivable<Color3 | Gradient<Color3>>;
			offset?: Derivable<UDim2>;
			transparency?: Derivable<number | Gradient<number>>;
			zIndex?: Derivable<number>;
			gradientRotation?: Derivable<number>;
			gradientOffset?: Derivable<Vector2>;
		}
	>
>;

export const borderDataBase = atom<BorderDataBase>(new Map());
