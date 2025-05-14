import { execSync } from "child_process"

try {
  console.log("Setting up database...")

  // Generate Prisma client
  console.log("Generating Prisma client...")
  execSync("npx prisma generate", { stdio: "inherit" })

  // Push schema to database
  console.log("Pushing schema to database...")
  execSync("npx prisma db push", { stdio: "inherit" })

  console.log("Database setup completed successfully!")
} catch (error) {
  console.error("Error setting up database:", error)
  process.exit(1)
}
