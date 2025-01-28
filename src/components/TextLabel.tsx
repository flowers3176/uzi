import Vide, {
	cleanup,
	read,
	show,
	Derivable,
	Node,
	For,
	action,
	source,
	FunctionNode,
	Show,
	derive,
} from "@rbxts/vide";
import { CustomFont, FontSpriteData } from "../utils/customFont";
import { Image } from "./Image";
import { Gradient } from "../utils/gradient";
import { destroyCleanUp } from "../utils/destroyCleanUp";
import { BaseFrame } from "./BaseFrame";

interface TextLabelProps {
	text?: Derivable<string>;
	size?: Derivable<UDim2>;
	position?: Derivable<UDim2>;
	anchorPoint?: Derivable<Vector2>;
	children?: Derivable<Node | undefined>;
	interactable?: Derivable<boolean>;
	transparency?: Derivable<number | Gradient<number>>;
	color?: Derivable<Color3 | Gradient<Color3>>;
	gradientRotation?: Derivable<number>;
	gradientOffset?: Derivable<Vector2>;
	zIndex?: Derivable<number>;
	textSize?: Derivable<number>;
	horizontalAlignment?: "Right" | "Center" | "Left";
	verticalAlignment?: "Top" | "Center" | "Bottom";
	font?: Derivable<Enum.Font["Name"] | CustomFont>;
}

interface CharProps {
	data: Derivable<{
		text: string;
		x: number;
		y: number;
		width: number;
		height: number;
		baseline: number;
	}>;
	transparency?: Derivable<number | Gradient<number>>;
	interactable?: Derivable<boolean>;
	gradientRotation?: Derivable<number>;
	gradientOffset?: Derivable<Vector2>;
	color?: Derivable<Color3 | Gradient<Color3>>;
	font: Derivable<CustomFont>;
	scale: Derivable<number>;
	layoutOrder: Derivable<number>;
	lines: Derivable<number>;
	children?: Node;
}

const defaultColorSequence = new ColorSequence(new Color3(1, 1, 1));
const defaultNumberSequence = new NumberSequence(0);

function Char({
	font,
	data,
	scale,
	layoutOrder,
	children,
	lines,
	color,
	transparency,
	interactable,
	gradientOffset,
	gradientRotation,
}: CharProps) {
	const size = () => {
		const { width, height } = read(data);
		return UDim2.fromOffset((width * read(scale)) / read(lines), (height * read(scale)) / read(lines));
	};
	return (
		<BaseFrame
			layoutOrder={layoutOrder}
			interactable={interactable}
			size={size}
			name={() => read(data).text}
			transparency={1}
		>
			<Image
				transparency={transparency}
				imageId={() => read(font).sprite}
				size={UDim2.fromScale(1, 1)}
				interactable={interactable}
				rectOffset={() => {
					const { x, y } = read(data);
					return new Vector2(x, y);
				}}
				color={color}
				gradientOffset={gradientOffset}
				gradientRotation={gradientRotation}
				rectSize={() => {
					const { width, height } = read(data);
					return new Vector2(width, height);
				}}
			/>
			{children}
		</BaseFrame>
	);
}

export function TextLabel({
	anchorPoint,
	children,
	interactable,
	color,
	gradientRotation,
	gradientOffset,
	position,
	size,
	verticalAlignment = "Center",
	horizontalAlignment = "Center",
	text,
	font,
	textSize,
	transparency,
	zIndex,
}: TextLabelProps) {
	const absSize = source(new Vector2());
	const isCustomFont = () =>
		!(typeIs(read(font), "Font") || typeIs(read(font), "string")) && read(font) !== undefined;
	const creationList: () => FontSpriteData[string][][] = () => {
		if (!isCustomFont()) return [];
		const fontClass = font as CustomFont;
		const creationList: FontSpriteData[string][][] = [];
		let currLine: FontSpriteData[string][] = [];
		for (const [char] of read(text) ?? "") {
			if (char === "\n") {
				creationList.push(currLine);
				currLine = [];
				continue;
			}
			const data = fontClass.getChar(char);
			currLine.push(data);
		}
		creationList.push(currLine);
		return creationList;
	};
	const charSizeScale = () => {
		let result = creationList().reduce(
			(acc, v) =>
				math.max(
					v.reduce((acc2, v2) => v2.width + acc2, 0),
					acc,
				),
			0,
		);
		const result2 = creationList().reduce(
			(acc, v) =>
				math.max(
					v.reduce((acc2, v2) => math.max(v2.height, acc2), 0),
					acc,
				),
			0,
		);

		creationList().forEach((v) => {
			const resultTemp = v.reduce((curr, { width }) => {
				return curr + width;
			}, 0);
			if (resultTemp > result) return (result = resultTemp);
		});

		const currentAbsSize = absSize();
		function calculateProportion(resultVal: number, axisVal: number) {
			const edge = axisVal - resultVal;
			const newProportion = (resultVal + edge) / resultVal;
			return newProportion;
		}
		return math.min(
			calculateProportion(result, currentAbsSize.X * creationList().size()),
			calculateProportion(result2, currentAbsSize.Y),
		);
	};

	function maxCharSizeYLine(line: () => number) {
		const result = creationList()[line() - 1].reduce((acc, v) => math.max(acc, v.height), 0);
		return result;
	}

	const getTransparency = derive(() => {
		const val = read(transparency);
		if (typeIs(val, "number")) return val;
		return 0;
	});
	const isInteractable = derive(() => read(interactable) ?? getTransparency() !== 1);

	return show(
		isCustomFont,
		() => {
			return (
				<BaseFrame
					name={"TextLabel"}
					zIndex={zIndex}
					interactable={interactable}
					position={position}
					anchorPoint={anchorPoint}
					size={() => read(size) ?? UDim2.fromScale(1, 1)}
					transparency={1}
				>
					{action((v) => {
						(v as Frame).GetPropertyChangedSignal("AbsoluteSize").Connect(() => {
							absSize((v as Frame).AbsoluteSize);
						});
						absSize((v as Frame).AbsoluteSize);
					})}
					<uilistlayout
						VerticalAlignment={verticalAlignment}
						HorizontalAlignment={horizontalAlignment}
						FillDirection={"Vertical"}
					/>
					<For each={creationList}>
						{(lineList, i) => {
							return (
								<BaseFrame
									interactable={interactable}
									name={() => `Line${i()}`}
									size={() =>
										new UDim2(
											1,
											0,
											0,
											(maxCharSizeYLine(i) * charSizeScale()) / creationList().size(),
										)
									}
									layoutOrder={i}
									transparency={1}
								>
									<uilistlayout
										VerticalAlignment={"Center"}
										HorizontalAlignment={horizontalAlignment}
										FillDirection={"Horizontal"}
									/>
									<For each={() => lineList}>
										{(charData, i) => {
											return (
												<Char
													transparency={transparency}
													interactable={interactable}
													lines={() => creationList().size()}
													layoutOrder={i}
													scale={charSizeScale}
													font={font as CustomFont}
													data={charData}
													color={color}
													gradientRotation={gradientRotation}
													gradientOffset={gradientOffset}
												></Char>
											);
										}}
									</For>
								</BaseFrame>
							);
						}}
					</For>
				</BaseFrame>
			);
		},
		() => (
			<textlabel
				Interactable={interactable}
				action={destroyCleanUp}
				Font={font as Enum.Font["Name"]}
				TextScaled={() => read(textSize) === undefined}
				TextSize={textSize}
				Text={text}
				ZIndex={zIndex}
				Position={() => read(position) ?? UDim2.fromScale(0.5, 0.5)}
				AnchorPoint={() => read(anchorPoint) ?? new Vector2(0.5, 0.5)}
				Size={() => read(size) ?? UDim2.fromScale(1, 1)}
				BackgroundTransparency={1}
				TextColor3={() => {
					const val = read(color);
					if (typeIs(val, "Color3")) return val;
					return new Color3(1, 1, 1);
				}}
				TextTransparency={() => {
					const val = read(transparency);
					if (typeIs(val, "number")) return val;
					return 0;
				}}
			>
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
				{children}
			</textlabel>
		),
	);
}
