export function deepEqual<T extends object, B extends object>(a: T, b: B) {
	let equal = true;
	// eslint-disable-next-line roblox-ts/no-array-pairs
	for (const [i, v] of pairs(a)) {
		const sibling = b[i as keyof typeof b];
		if (sibling === undefined) {
			equal = false;
			break;
		}

		if (typeIs(v, "table") && typeIs(sibling, "table")) {
			const result = deepEqual(v, sibling);
			if (!result) {
				equal = false;
				break;
			}
		}

		if (v !== sibling) {
			equal = false;
			break;
		}
	}
	return equal;
}
