import Vide, { cleanup } from "@rbxts/vide";
import { Derivable } from "@rbxts/vide";

interface CornerProps {
	radius?: Derivable<UDim>;
}
export function Corner({ radius }: CornerProps) {
	return <uicorner CornerRadius={radius} action={cleanup} />;
}
