import { KiteConnect } from "kiteconnect";
import dotenv from "dotenv";

//const apiSecret = process.env.API_SECRET || "";
//const requestToken = process.env.REQUEST_TOKEN||"";
dotenv.config();
const apiKey = process.env.API_KEY || "";
let access_token = process.env.ACCESS_TOKEN || "";

const kc = new KiteConnect({ api_key: apiKey });
console.log(kc.getLoginURL());
kc.setAccessToken(access_token);

export async function placeOrder(
  tradingsymbol: string,
  transaction_type: "BUY" | "SELL",
  quantity: number
) {
  try {
    // await generateSession();
  

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

export async function getPositions() {
    try {
        const holdings = await kc.getPositions();
        let allHoldings = "";
        holdings.net.map((holding) => {
            allHoldings += `stock: ${holding.tradingsymbol}, quantity: ${holding.quantity}, currentPrice: ${holding.last_price}\n`;
        });
        return allHoldings;
    } catch (err) {
        console.error("Error fetching holdings:", err);
        throw err;
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
