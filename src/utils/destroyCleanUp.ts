import { cleanup } from "@rbxts/vide";

export function destroyCleanUp(instance: Instance) {
	cleanup(() => (instance.Parent = undefined));
}
