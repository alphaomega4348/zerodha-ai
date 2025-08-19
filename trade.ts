import { KiteConnect } from "kiteconnect";
import dotenv from "dotenv";

//const apiSecret = process.env.API_SECRET || "";
//const requestToken = process.env.REQUEST_TOKEN||"";
const apiKey = process.env.API_KEY || "";
let access_token = process.env.ACCESS_TOKEN || "";
const kc = new KiteConnect({ api_key: apiKey });
console.log(kc.getLoginURL());
export async function placeOrder(
  tradingsymbol: string,
  transaction_type: "BUY" | "SELL",
  quantity: number
) {
  try {
    // await generateSession();
    kc.setAccessToken(access_token);

    await kc.placeOrder("regular", {
      exchange: "NSE",
      tradingsymbol,
      transaction_type,
      quantity,
      order_type: "MARKET",
      product: "MIS",
    });
  } catch (err) {
    console.error(err);
  }
}

// async function generateSession() {
//   try {
//     const response = await kc.generateSession(requestToken, apiSecret);
//     kc.setAccessToken(response.access_token);
//     console.log("Session generated:", response);
//   } catch (err) {
//     console.error("Error generating session:", err);
//   }
// }
