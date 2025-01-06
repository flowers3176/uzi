import { IS_EDIT } from "../constants";

import { Group } from "./Group";
import { cleanup, Node, show } from "@rbxts/vide";
import Vide from "@rbxts/vide";

interface LayerProps {
	displayOrder?: number;
	children?: Node;
}

export function Layer({ displayOrder, children }: LayerProps) {
	return show(
		() => IS_EDIT,
		() => <Group zIndex={displayOrder}>{children}</Group>,
		() => (
			<screengui
				ClipToDeviceSafeArea={false}
				ResetOnSpawn={false}
				DisplayOrder={displayOrder}
				IgnoreGuiInset
				ZIndexBehavior="Sibling"
				action={cleanup}
			>
				{children}
			</screengui>
		),
	);
}
