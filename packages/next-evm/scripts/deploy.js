const hre = require('hardhat');

const main = async () => {
	const ContractFactory = await hre.ethers.getContractFactory('CounterRelayContextERC2771'); // the file name under 'contracts' folder, without '.sol'
	const Contract = await ContractFactory.deploy(); // the constructor params
	await Contract.deployed();
	console.log('Contract deployed to:', Contract.address);

	// // You can test the function.
	// let txn = await nftContract.functionName()
	// // Wait for it to be mined.
	// await txn.wait()
	// console.log("function invoked!")
};

const runMain = async () => {
	try {
		await main();
		process.exit(0); // emit the exit event that ends all tasks immediately even if there still are asynchronous operations not been done. The shell that executed node should see the exit code as 0.
	} catch (error) {
		console.log(error);
		process.exit(1);
	}
};

runMain();
