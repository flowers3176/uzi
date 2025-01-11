import Vide, { cleanup } from "@rbxts/vide";
import { Derivable } from "@rbxts/vide";
import { destroyCleanUp } from "../utils/destroyCleanUp";

interface CornerProps {
	radius?: Derivable<UDim>;
}
export function Corner({ radius }: CornerProps) {
	return <uicorner CornerRadius={radius} action={destroyCleanUp} />;
}
