export async function verifyOnChain(claimId: string) {
  console.log(`Blockchain verify: ${claimId}`);
  return { success: true, txId: "mock_" + claimId };
}