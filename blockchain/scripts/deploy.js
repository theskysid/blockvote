import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("🚀 Deploying Voting contract...");

  // Get the ContractFactory and Signers
  const Voting = await hre.ethers.getContractFactory("Voting");
  
  // Deploy the contract
  const voting = await Voting.deploy();
  
  // Wait for deployment to complete
  await voting.waitForDeployment();
  
  const contractAddress = await voting.getAddress();
  
  console.log("✅ Voting contract deployed to:", contractAddress);
  
  // Save deployment info to JSON files for the backend
  const deploymentInfo = {
    contractAddress: contractAddress,
    deployer: (await hre.ethers.getSigners())[0].address,
    deploymentTime: new Date().toISOString(),
    network: hre.network.name,
    chainId: hre.network.config.chainId
  };
  
  // Write deployment info
  fs.writeFileSync(
    path.join(__dirname, "..", "deployed.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  // Get and save contract ABI
  const artifact = await hre.artifacts.readArtifact("Voting");
  fs.writeFileSync(
    path.join(__dirname, "..", "VotingABI.json"),
    JSON.stringify(artifact.abi, null, 2)
  );
  
  console.log("📄 Contract ABI saved to VotingABI.json");
  console.log("📋 Deployment info saved to deployed.json");
  
  // Add some test candidates for demo
  console.log("🗳️  Adding test candidates...");
  
  await voting.addCandidate("Alice Johnson");
  await voting.addCandidate("Bob Smith");
  await voting.addCandidate("Carol Williams");
  
  console.log("✅ Test candidates added!");
  console.log("\n🎉 Blockchain setup complete!");
  console.log("📡 Local blockchain running on: http://localhost:8545");
  console.log("📋 Contract Address:", contractAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });