export interface FontSpriteData {
	[key: string]: {
		text: string;
		x: number;
		y: number;
		width: number;
		height: number;
		baseline: number;
	};
}
export class CustomFont {
	constructor(
		public sprite: string,
		private spriteData: FontSpriteData,
	) {}
	getChar(char: string): FontSpriteData[string] {
		return table.clone(this.spriteData[tostring(string.byte(char)[0])]);
	}
}
