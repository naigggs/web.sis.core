import { randomBytes } from "crypto"

const BYTE_LENGTH = 64 // 512 bits

function generateSecret(): string {
  return randomBytes(BYTE_LENGTH).toString("hex")
}

function main() {
  console.log("=== JWT Secret Generator ===\n")

  const accessSecret = generateSecret()
  const refreshSecret = generateSecret()

  console.log("Copy the values below into your .env file:\n")
  console.log(`JWT_ACCESS_SECRET_KEY=${accessSecret}`)
  console.log(`JWT_REFRESH_SECRET_KEY=${refreshSecret}`)
  console.log()
}

main()
