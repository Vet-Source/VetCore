export async function recordOnChain(data: any) {
  console.log(`Recording on chain:`, data);
  return { success: true, txId: "VS_" + Date.now() };
}