import { KiteConnect } from "kiteconnect";

export interface StockInfo {
  tradingsymbol: string;
  name: string;
  exchange: string;
}

export interface ValidationResult {
  isValid: boolean;
  validatedSymbol?: string;
  suggestions: StockInfo[];
  message: string;
}

export class SimpleStockValidator {
  private stockDatabase: Map<string, StockInfo> = new Map();
  private nameToSymbolMap: Map<string, string[]> = new Map();

  constructor() {
    this.initializeStockDatabase();
  }

  /**
   * Initialize the stock database with common stocks and their mappings
   */
  private initializeStockDatabase(): void {
    const stocks: StockInfo[] = [
      // Banking & Financial Services
      { tradingsymbol: "HDFCBANK", name: "HDFC Bank Ltd", exchange: "NSE" },
      { tradingsymbol: "ICICIBANK", name: "ICICI Bank Ltd", exchange: "NSE" },
      { tradingsymbol: "KOTAKBANK", name: "Kotak Mahindra Bank Ltd", exchange: "NSE" },
      { tradingsymbol: "AXISBANK", name: "Axis Bank Ltd", exchange: "NSE" },
      { tradingsymbol: "SBIN", name: "State Bank of India", exchange: "NSE" },
      { tradingsymbol: "INDUSINDBK", name: "IndusInd Bank Ltd", exchange: "NSE" },
      { tradingsymbol: "BAJFINANCE", name: "Bajaj Finance Ltd", exchange: "NSE" },
      { tradingsymbol: "BAJAJFINSV", name: "Bajaj Finserv Ltd", exchange: "NSE" },
      { tradingsymbol: "HDFCLIFE", name: "HDFC Life Insurance Company Ltd", exchange: "NSE" },
      { tradingsymbol: "ICICIGI", name: "ICICI Lombard General Insurance Company Ltd", exchange: "NSE" },
      { tradingsymbol: "ICICIPRULI", name: "ICICI Prudential Life Insurance Company Ltd", exchange: "NSE" },

      // IT Services
      { tradingsymbol: "TCS", name: "Tata Consultancy Services Ltd", exchange: "NSE" },
      { tradingsymbol: "INFY", name: "Infosys Ltd", exchange: "NSE" },
      { tradingsymbol: "WIPRO", name: "Wipro Ltd", exchange: "NSE" },
      { tradingsymbol: "HCLTECH", name: "HCL Technologies Ltd", exchange: "NSE" },
      { tradingsymbol: "TECHM", name: "Tech Mahindra Ltd", exchange: "NSE" },

      // Oil & Gas
      { tradingsymbol: "RELIANCE", name: "Reliance Industries Ltd", exchange: "NSE" },
      { tradingsymbol: "ONGC", name: "Oil & Natural Gas Corporation Ltd", exchange: "NSE" },
      { tradingsymbol: "IOC", name: "Indian Oil Corporation Ltd", exchange: "NSE" },
      { tradingsymbol: "BPCL", name: "Bharat Petroleum Corporation Ltd", exchange: "NSE" },

      // Telecommunications
      { tradingsymbol: "BHARTIARTL", name: "Bharti Airtel Ltd", exchange: "NSE" },

      // Consumer Goods
      { tradingsymbol: "ITC", name: "ITC Ltd", exchange: "NSE" },
      { tradingsymbol: "HINDUNILVR", name: "Hindustan Unilever Ltd", exchange: "NSE" },
      { tradingsymbol: "NESTLEIND", name: "Nestle India Ltd", exchange: "NSE" },
      { tradingsymbol: "BRITANNIA", name: "Britannia Industries Ltd", exchange: "NSE" },
      { tradingsymbol: "ASIANPAINT", name: "Asian Paints Ltd", exchange: "NSE" },

      // Automotive
      { tradingsymbol: "MARUTI", name: "Maruti Suzuki India Ltd", exchange: "NSE" },
      { tradingsymbol: "TATAMOTORS", name: "Tata Motors Ltd", exchange: "NSE" },
      { tradingsymbol: "M&M", name: "Mahindra & Mahindra Ltd", exchange: "NSE" },
      { tradingsymbol: "HEROMOTOCO", name: "Hero MotoCorp Ltd", exchange: "NSE" },
      { tradingsymbol: "EICHERMOT", name: "Eicher Motors Ltd", exchange: "NSE" },

      // Metals & Mining
      { tradingsymbol: "TATASTEEL", name: "Tata Steel Ltd", exchange: "NSE" },
      { tradingsymbol: "JSWSTEEL", name: "JSW Steel Ltd", exchange: "NSE" },
      { tradingsymbol: "HINDALCO", name: "Hindalco Industries Ltd", exchange: "NSE" },
      { tradingsymbol: "COALINDIA", name: "Coal India Ltd", exchange: "NSE" },

      // Infrastructure & Construction
      { tradingsymbol: "LT", name: "Larsen & Toubro Ltd", exchange: "NSE" },
      { tradingsymbol: "ADANIPORTS", name: "Adani Ports and Special Economic Zone Ltd", exchange: "NSE" },
      { tradingsymbol: "ADANIENT", name: "Adani Enterprises Ltd", exchange: "NSE" },
      { tradingsymbol: "ADANIGREEN", name: "Adani Green Energy Ltd", exchange: "NSE" },

      // Pharmaceuticals
      { tradingsymbol: "SUNPHARMA", name: "Sun Pharmaceutical Industries Ltd", exchange: "NSE" },
      { tradingsymbol: "DRREDDY", name: "Dr. Reddy's Laboratories Ltd", exchange: "NSE" },
      { tradingsymbol: "CIPLA", name: "Cipla Ltd", exchange: "NSE" },
      { tradingsymbol: "DIVISLAB", name: "Divi's Laboratories Ltd", exchange: "NSE" },
      { tradingsymbol: "APOLLOHOSP", name: "Apollo Hospitals Enterprise Ltd", exchange: "NSE" },

      // Cement
      { tradingsymbol: "ULTRACEMCO", name: "UltraTech Cement Ltd", exchange: "NSE" },
      { tradingsymbol: "SHREECEM", name: "Shree Cement Ltd", exchange: "NSE" },
      { tradingsymbol: "GRASIM", name: "Grasim Industries Ltd", exchange: "NSE" },

      // Power & Utilities
      { tradingsymbol: "NTPC", name: "NTPC Ltd", exchange: "NSE" },
      { tradingsymbol: "POWERGRID", name: "Power Grid Corporation of India Ltd", exchange: "NSE" },

      // Consumer Durables
      { tradingsymbol: "TITAN", name: "Titan Company Ltd", exchange: "NSE" }
    ];

    // Populate the main database
    stocks.forEach(stock => {
      this.stockDatabase.set(stock.tradingsymbol.toUpperCase(), stock);
      
      // Create name-to-symbol mappings for search
      const nameWords = stock.name.toUpperCase().split(/\s+/);
      nameWords.forEach(word => {
        if (word.length > 2) {
          if (!this.nameToSymbolMap.has(word)) {
            this.nameToSymbolMap.set(word, []);
          }
          this.nameToSymbolMap.get(word)!.push(stock.tradingsymbol);
        }
      });
    });

    console.log(`Initialized stock database with ${stocks.length} stocks`);
  }

  /**
   * Get common symbol variations and mappings
   */
  private getSymbolVariations(input: string): string[] {
    const normalized = input.toUpperCase().replace(/\s+/g, '').replace(/[^A-Z0-9]/g, '');
    const variations: string[] = [normalized];

    // Common symbol mappings
    const commonMappings: Record<string, string[]> = {
      'HDFC': ['HDFCBANK', 'HDFCLIFE'],
      'HDFCBANK': ['HDFCBANK'],
      'ICICI': ['ICICIBANK', 'ICICIGI', 'ICICIPRULI'],
      'ICICIBANK': ['ICICIBANK'],
      'RELIANCE': ['RELIANCE'],
      'TCS': ['TCS'],
      'INFOSYS': ['INFY'],
      'INFY': ['INFY'],
      'WIPRO': ['WIPRO'],
      'BHARTIAIRTEL': ['BHARTIARTL'],
      'BHARTI': ['BHARTIARTL'],
      'AIRTEL': ['BHARTIARTL'],
      'SBIN': ['SBIN'],
      'SBI': ['SBIN'],
      'ITC': ['ITC'],
      'KOTAKBANK': ['KOTAKBANK'],
      'KOTAK': ['KOTAKBANK'],
      'AXISBANK': ['AXISBANK'],
      'AXIS': ['AXISBANK'],
      'LT': ['LT'],
      'LARSEN': ['LT'],
      'MARUTI': ['MARUTI'],
      'TITAN': ['TITAN'],
      'TATASTEEL': ['TATASTEEL'],
      'TATA': ['TATASTEEL', 'TATAMOTORS', 'TCS'],
      'BAJFINANCE': ['BAJFINANCE'],
      'BAJAJ': ['BAJFINANCE', 'BAJAJFINSV'],
      'NESTLEIND': ['NESTLEIND'],
      'NESTLE': ['NESTLEIND'],
      'HINDALCO': ['HINDALCO'],
      'HINDUNILVR': ['HINDUNILVR'],
      'HUL': ['HINDUNILVR'],
      'ADANIPORTS': ['ADANIPORTS'],
      'ADANI': ['ADANIPORTS', 'ADANIENT', 'ADANIGREEN'],
      'SUNPHARMA': ['SUNPHARMA'],
      'ULTRACEMCO': ['ULTRACEMCO'],
      'ULTRATECH': ['ULTRACEMCO'],
      'ASIANPAINT': ['ASIANPAINT'],
      'NTPC': ['NTPC'],
      'POWERGRID': ['POWERGRID'],
      'ONGC': ['ONGC'],
      'COALINDIA': ['COALINDIA'],
      'DRREDDY': ['DRREDDY'],
      'EICHERMOT': ['EICHERMOT'],
      'JSWSTEEL': ['JSWSTEEL'],
      'TATAMOTORS': ['TATAMOTORS'],
      'TECHM': ['TECHM'],
      'HCLTECH': ['HCLTECH'],
      'HCL': ['HCLTECH'],
      'BRITANNIA': ['BRITANNIA'],
      'CIPLA': ['CIPLA'],
      'DIVISLAB': ['DIVISLAB'],
      'HEROMOTOCO': ['HEROMOTOCO'],
      'HERO': ['HEROMOTOCO'],
      'INDUSINDBK': ['INDUSINDBK'],
      'INDUSIND': ['INDUSINDBK'],
      'SHREECEM': ['SHREECEM'],
      'GRASIM': ['GRASIM'],
      'BPCL': ['BPCL'],
      'IOC': ['IOC'],
      'MM': ['M&M'],
      'MAHINDRA': ['M&M'],
      'APOLLOHOSP': ['APOLLOHOSP'],
      'APOLLO': ['APOLLOHOSP']
    };

    if (commonMappings[normalized]) {
      variations.push(...commonMappings[normalized]);
    }

    // Try adding/removing common suffixes
    const suffixes = ['BANK', 'LTD', 'IND'];
    suffixes.forEach(suffix => {
      if (normalized.endsWith(suffix)) {
        variations.push(normalized.replace(suffix, ''));
      } else {
        variations.push(normalized + suffix);
      }
    });

    return [...new Set(variations)]; // Remove duplicates
  }

  /**
   * Find stocks by name or partial matches
   */
  private findByName(searchTerm: string): StockInfo[] {
    const matches: StockInfo[] = [];
    const upperSearchTerm = searchTerm.toUpperCase();

    // Search in company names
    for (const [word, symbols] of this.nameToSymbolMap.entries()) {
      if (word.includes(upperSearchTerm) || upperSearchTerm.includes(word)) {
        symbols.forEach(symbol => {
          const stock = this.stockDatabase.get(symbol);
          if (stock) {
            matches.push(stock);
          }
        });
      }
    }

    // Also search for partial symbol matches
    for (const [symbol, stock] of this.stockDatabase.entries()) {
      if (symbol.includes(upperSearchTerm) || upperSearchTerm.includes(symbol)) {
        matches.push(stock);
      }
    }

    // Remove duplicates
    const uniqueMatches = new Map<string, StockInfo>();
    matches.forEach(stock => {
      uniqueMatches.set(stock.tradingsymbol, stock);
    });

    return Array.from(uniqueMatches.values());
  }

  /**
   * Main validation function
   */
  async validateStock(userInput: string): Promise<ValidationResult> {
    const variations = this.getSymbolVariations(userInput);
    
    // Try exact matches first
    for (const variation of variations) {
      const stock = this.stockDatabase.get(variation);
      if (stock) {
        return {
          isValid: true,
          validatedSymbol: stock.tradingsymbol,
          suggestions: [stock],
          message: `Found: ${stock.tradingsymbol} - ${stock.name}`
        };
      }
    }

    // If no exact match, try fuzzy search
    const suggestions = this.findByName(userInput);
    
    if (suggestions.length > 0) {
      return {
        isValid: false,
        suggestions: suggestions.slice(0, 10),
        message: `"${userInput}" not found. Here are some suggestions:`
      };
    }

    return {
      isValid: false,
      suggestions: [],
      message: `No stocks found matching "${userInput}". Please check the symbol and try again.`
    };
  }

  /**
   * Check if a symbol exists (for simple validation)
   */
  isValidSymbol(symbol: string): boolean {
    return this.stockDatabase.has(symbol.toUpperCase());
  }

  /**
   * Get stock info by symbol
   */
  getStockInfo(symbol: string): StockInfo | null {
    return this.stockDatabase.get(symbol.toUpperCase()) || null;
  }

  /**
   * Search for stocks (useful for search functionality)
   */
  searchStocks(query: string): StockInfo[] {
    return this.findByName(query).slice(0, 10);
  }
}

// Helper function to format suggestions
export function formatSuggestions(suggestions: StockInfo[]): string {
  if (suggestions.length === 0) {
    return "No matching stocks found.";
  }

  let formatted = "\nAvailable options:";
  suggestions.forEach((stock, index) => {
    formatted += `\n${index + 1}. ${stock.tradingsymbol} - ${stock.name}`;
  });
  
  return formatted;
}

// Create a singleton instance
export const stockValidator = new SimpleStockValidator();