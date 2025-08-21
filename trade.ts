// trade.ts - Updated with simple stock validation and missing functions
import { KiteConnect } from "kiteconnect";
import { stockValidator } from "./stockValidator";
import type { ValidationResult } from "./stockValidator";

const apiKey = "ze077gigne7ev9ac";
let access_token = "fQFZvotKH67j45ZyQrAtjJQnjL5HoiOV";

const kc = new KiteConnect({ api_key: apiKey });
console.log("Login URL:", kc.getLoginURL());
kc.setAccessToken(access_token);

export async function placeOrder(
  tradingsymbol: string,
  transaction_type: "BUY" | "SELL",
  quantity: number
): Promise<any> {
  try {
    console.log(`Placing order: ${transaction_type} ${quantity} ${tradingsymbol}`);
    
    const order = await kc.placeOrder("regular", {
      exchange: "NSE",
      tradingsymbol,
      transaction_type,
      quantity,
      order_type: "MARKET",
      product: "MIS", // Intraday product
      validity: "DAY"
    });
    
    console.log("Order placed successfully:", order);
    return order;
  } catch (err) {
    console.error("Error placing order:", err);
    // Log the full error details
    if (err instanceof Error && "response" in err) {
      const response = (err as any).response;
      console.error("Response data:", response.data);
      console.error("Response status:", response.status);
    }
    throw err;
  }
}

// Enhanced order function that returns validation info
export async function placeOrderWithValidation(
  userInput: string,
  transaction_type: "BUY" | "SELL",
  quantity: number
): Promise<{
  success: boolean;
  message: string;
  validatedSymbol?: string;
  suggestions?: any[];
  orderId?: string;
}> {
  try {
    // Validate stock symbol using simple validator
    const validation = await stockValidator.validateStock(userInput);
    
    if (!validation.isValid) {
      return {
        success: false,
        message: validation.message,
        suggestions: validation.suggestions
      };
    }
    
    // Place the order with validated symbol
    const order = await placeOrder(validation.validatedSymbol!, transaction_type, quantity);
    
    return {
      success: true,
      message: `Order placed successfully for ${validation.validatedSymbol} - ${validation.suggestions[0]?.name}`,
      validatedSymbol: validation.validatedSymbol,
      orderId: order.order_id
    };
  }
  catch (error) {
    console.error("Error in placeOrderWithValidation:", error);
    
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      validatedSymbol: undefined,
      suggestions: []
    };
  }
}

// Initialize stock validator function
export async function initializeStockValidator(): Promise<void> {
  try {
    console.log("Stock validator initialized successfully");
    // The stockValidator is already initialized in its constructor
    // This function exists for consistency with the import in index.ts
  } catch (error) {
    console.error("Error initializing stock validator:", error);
    throw error;
  }
}

// Get holdings function
export async function getHoldings(): Promise<string> {
  try {
    const holdings = await kc.getHoldings();
    
    if (!holdings || holdings.length === 0) {
      return "No holdings found in your portfolio.";
    }
    
    let holdingsText = "📊 Your Current Holdings:\n\n";
    holdings.forEach((holding: any, index: number) => {
      holdingsText += `${index + 1}. ${holding.tradingsymbol} (${holding.exchange})\n`;
      holdingsText += `   Quantity: ${holding.quantity}\n`;
      holdingsText += `   Average Price: ₹${holding.average_price}\n`;
      holdingsText += `   Current Price: ₹${holding.last_price}\n`;
      holdingsText += `   P&L: ₹${holding.pnl} (${holding.pnl > 0 ? '+' : ''}${((holding.pnl / (holding.average_price * holding.quantity)) * 100).toFixed(2)}%)\n`;
      holdingsText += `   Market Value: ₹${holding.last_price * holding.quantity}\n\n`;
    });
    
    // Calculate total portfolio value
    const totalValue = holdings.reduce((sum: number, holding: any) => 
      sum + (holding.last_price * holding.quantity), 0
    );
    const totalPnL = holdings.reduce((sum: number, holding: any) => 
      sum + holding.pnl, 0
    );
    
    holdingsText += `💰 Total Portfolio Value: ₹${totalValue.toFixed(2)}\n`;
    holdingsText += `📈 Total P&L: ₹${totalPnL.toFixed(2)}`;
    
    return holdingsText;
  } catch (error) {
    console.error("Error fetching holdings:", error);
    throw new Error(`Failed to fetch holdings: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Search stock function (for completeness)
export async function searchStock(query: string): Promise<{
  found: boolean;
  message: string;
  suggestions: any[];
}> {
  try {
    const result = await stockValidator.validateStock(query);
    
    if (result.isValid) {
      return {
        found: true,
        message: `Found exact match: ${result.validatedSymbol} - ${result.suggestions[0]?.name}`,
        suggestions: result.suggestions
      };
    } else {
      return {
        found: false,
        message: result.message,
        suggestions: result.suggestions
      };
    }
  } catch (error) {
    console.error("Error in searchStock:", error);
    return {
      found: false,
      message: error instanceof Error ? error.message : "Unknown error",
      suggestions: []
    };
  }
}