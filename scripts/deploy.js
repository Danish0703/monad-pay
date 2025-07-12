import hre from "hardhat";

async function main() {
  console.log("Deploying PaymentProcessor contract...");

  // Get the contract factory
  const PaymentProcessor = await hre.ethers.getContractFactory("PaymentProcessor");

  // Deploy the contract
  const feeRecipient = "0x1234567890123456789012345678901234567890"; // Replace with actual fee recipient
  const paymentProcessor = await PaymentProcessor.deploy(feeRecipient);

  await paymentProcessor.waitForDeployment();

  const address = await paymentProcessor.getAddress();
  console.log("PaymentProcessor deployed to:", address);

  // Verify the contract on Etherscan (if supported)
  if (hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await paymentProcessor.deploymentTransaction().wait(6);

    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [feeRecipient],
      });
      console.log("Contract verified on Etherscan");
    } catch (error) {
      console.log("Error verifying contract:", error.message);
    }
  }

  console.log("Deployment completed!");
  console.log("Contract address:", address);
  console.log("Fee recipient:", feeRecipient);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });