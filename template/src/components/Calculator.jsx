import S from "@surplus/s";

import * as C from "./Calculator.css";

export default () => {
	const formula = S.data("2 * (2 * 2 + 2) * 2 * 2 - 2 * 2 - 2");
	const calculation = S(() => {
		const f = formula();
		if (!f) return 0;
		if (/[^0-9+\-*/(). ]/.test(f)) return false;
		// eslint-disable-next-line no-eval
		return eval(f);
	});

	let input;
	return (
		<div class={C.root}>
			<label for="formula">Enter a formula:</label>
			<input
				type="text"
				name="formula"
				id="formula"
				value={S.sample(formula)}
				ref={input}
				on:input={() => formula(input.value)}
			/>
			<span class={"result" /* @global class, from global.css */}>
				= {calculation() !== false ? calculation() : undefined}
			</span>
		</div>
	);
};
