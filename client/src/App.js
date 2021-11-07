import React, { Component } from "react";
import ItemManagerContract from "./contracts/ItemManager.json";
import ItemContract from "./contracts/Item.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
	state = {
		storageValue: 0,
		web3: null,
		accounts: null,
		itemManagerContract: null,
		itemContract: null,
		cost: 0,
		itemName: "example1",
	};

	componentDidMount = async () => {
		try {
			// Get network provider and web3 instance.
			const web3 = await getWeb3();

			// Use web3 to get the user's accounts.
			const accounts = await web3.eth.getAccounts();

			// Get the contract instance.
			const networkId = await web3.eth.net.getId();
			const itemManager = new web3.eth.Contract(
				ItemManagerContract.abi,
				ItemManagerContract.networks[networkId] && ItemManagerContract.networks[networkId].address
			);
			const item = new web3.eth.Contract(
				ItemContract.abi,
				ItemContract.networks[networkId] && ItemContract.networks[networkId].address
			);

			// Set web3, accounts, and contract to the state, and then proceed with an
			// example of interacting with the contract's methods.
			this.setState({ web3, accounts, itemManagerContract: itemManager, itemContract: item });
			this.listenToPaymentEvent();
		} catch (error) {
			// Catch any errors for any of the above operations.
			alert(`Failed to load web3, accounts, or contract. Check console for details.`);
			console.error(error);
		}
	};

	listenToPaymentEvent = () => {
		this.state.itemManagerContract.events.SupplyChainStep().on("data", async (event) => {
			console.log(event);
			let itemObj = await this.state.itemManagerContract.methods.items(event.returnValues._itemIndex).call();
			console.log("itemObj", itemObj);
		});
	};

	handleSubmit = async () => {
		const { accounts, itemManagerContract } = this.state;
		const { itemName, cost } = this.state;
		const result = await itemManagerContract.methods.createItem(itemName, cost).send({ from: accounts[0] });
		console.log(`result`, result);
	};
	render() {
		if (!this.state.web3) {
			return <div>Loading Web3, accounts, and contract...</div>;
		}
		return (
			<div className="App">
				<h1>Event Trigger / Supply Chain Example</h1>
				<h2>Items</h2>
				<h2>Add Items</h2>
				Cost in Wei:{" "}
				<input
					type="text"
					name="cost"
					value={this.state.cost}
					onChange={(e) => {
						this.setState({
							cost: e.target.value,
						});
					}}
				/>
				Item Id:{" "}
				<input
					type="text"
					name="itemName"
					value={this.state.itemName}
					onChange={(e) => {
						this.setState({
							itemName: e.target.value,
						});
					}}
				/>
				<button type="button" onClick={this.handleSubmit}>
					{" "}
					Create new Item
				</button>
			</div>
		);
	}
}

export default App;
