import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: "ADMIN" | "STOCK_MANAGER" | "CASHIER"
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: "ADMIN" | "STOCK_MANAGER" | "CASHIER"
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: "ADMIN" | "STOCK_MANAGER" | "CASHIER"
  }
}
