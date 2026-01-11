import S from "@surplus/s";

import "./global.css";

import Calculator from "./components/Calculator.jsx";

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
