import prompts from "prompts"
import { userService } from "../domain/user/user.service"
import { createUserSchema } from "../domain/user/user.schema"

async function main() {
  console.log("=== Admin User Creation CLI ===")

  // Collect email
  const basicInfo = await prompts(
    [
      {
        type: "text",
        name: "email",
        message: "Email:",
        validate: (value) => {
          const result = createUserSchema.shape.email.safeParse(value)
          return result.success ? true : "Invalid email address"
        },
      },
    ],
    {
      onCancel: () => {
        console.log("Operation cancelled")
        process.exit(0)
      },
    },
  )

  // Collect Password with Retry Loop
  let password = ""
  while (true) {
    const passwordResponse = await prompts(
      [
        {
          type: "password",
          name: "password",
          message: "Password:",
          validate: (value) =>
            value.length >= 8 ? true : "Password must be at least 8 characters",
        },
        {
          type: "password",
          name: "confirmPassword",
          message: "Confirm Password:",
        },
      ],
      {
        onCancel: () => {
          console.log("Operation cancelled")
          process.exit(0)
        },
      },
    )

    if (passwordResponse.password === passwordResponse.confirmPassword) {
      password = passwordResponse.password
      break
    } else {
      console.log("Passwords do not match. Please try again.\n")
    }
  }

  try {
    console.log("\nCreating admin user...")
    const user = await userService.create({
      email: basicInfo.email,
      password,
      confirmPassword: password,
      role: "admin",
    })

    console.log("\n✓ Admin user created successfully!")
    console.log(`  ID:    ${user?.id}`)
    console.log(`  Email: ${user?.email}`)
    console.log(`  Role:  ${user?.role}`)

    process.exit(0)
  } catch (error: any) {
    console.error(`\nError: ${error.message}`)
    process.exit(1)
  }
}

main()
