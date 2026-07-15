import z from "zod";

const envSchema = z.object({
  MONGODB_URI: z.string().min(1, "Mongodb uri is required"),
  NODE_ENV: z.enum(["development", "production", "testing"]).default("development"),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "Cloudinary cloud name is requrired"),
  CLOUDINARY_API_KEY: z.string().min(1, "Cloudinary api key is required"),
  CLOUDINARY_SECRET_KEY: z.string().min(1, "Cloudinary secret key is requrired"),
  JWT_ACCESS_SECRET: z.string().min(32, "JWT Secret must be at least 32 char long"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT Refresh Secret must be at least 32 char long")
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.message);
  throw new Error("Invalid environment variables");
}

export const env = parsed.data