import S from "@surplus/s";

const Calculator = () => {
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
		<div class="calculator">
			<label for="formula">Enter a formula:</label>
			<input
				type="text"
				value={S.sample(formula)}
				ref={input}
				on:input={() => formula(input.value)}
			/>
			<span class="result">
				= {calculation() !== false ? calculation() : undefined}
			</span>
		</div>
	);
};

const Root = () => (
	<div id="root">
		<div id="content">
			<h1>
				Welcome to your Surplus application,{" "}
				<strong>{{ PKG_NAME }}</strong>!
			</h1>
			<p>
				You can start editing the code in <code>src/app.jsx</code> to
				build your application.
			</p>
			<p>
				For example, here's a calculator that updates in real-time:
				<Calculator />
			</p>
		</div>
	</div>
);

// Mount the root component to the document body
S.root(() => document.body.prepend(<Root />));
