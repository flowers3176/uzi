import { action } from "@rbxts/vide";

interface InputProps {
	inputBegan?: (inputObject: InputObject) => void;
	inputEnded?: (inputObject: InputObject) => void;
	inputChanged?: (inputObject: InputObject) => void;
	mouseEnter?: (x: number, y: number) => void;
	mouseLeave?: (x: number, y: number) => void;
	mouseWheelForward?: (x: number, y: number) => void;
	mouseWheelBackward?: (x: number, y: number) => void;
	activated?: () => void;
}

export function Input({
	inputBegan,
	inputEnded,
	inputChanged,
	mouseEnter,
	mouseLeave,
	activated,
	mouseWheelBackward,
	mouseWheelForward,
}: InputProps) {
	return action((instance) => {
		if (!instance.IsA("GuiObject")) return;
		if (inputBegan !== undefined) instance.InputBegan.Connect(inputBegan);
		if (inputEnded !== undefined) instance.InputEnded.Connect(inputEnded);
		if (inputChanged !== undefined) instance.InputChanged.Connect(inputChanged);
		if (mouseEnter !== undefined) instance.MouseEnter.Connect(mouseEnter);
		if (mouseLeave !== undefined) instance.MouseLeave.Connect(mouseLeave);
		if (mouseWheelBackward !== undefined) instance.MouseWheelBackward.Connect(mouseWheelBackward);
		if (mouseWheelForward !== undefined) instance.MouseWheelForward.Connect(mouseWheelForward);
		let clicking = false;
		instance.InputBegan.Connect((v) => {
			if (
				v.UserInputType !== Enum.UserInputType.MouseButton1 &&
				v.UserInputType !== Enum.UserInputType.Touch &&
				v.UserInputType !== Enum.UserInputType.Gamepad1
			)
				return;
			clicking = true;
		});

		instance.InputEnded.Connect((v) => {
			if (
				v.UserInputType !== Enum.UserInputType.MouseButton1 &&
				v.UserInputType !== Enum.UserInputType.Touch &&
				v.UserInputType !== Enum.UserInputType.Gamepad1
			)
				return;
			if (clicking) {
				clicking = false;
				if (activated !== undefined) task.spawn(activated);
			}
		});
	});
}
