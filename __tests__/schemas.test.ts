import { describe, it, expect } from "@jest/globals";
import { loginSchema, registerSchema, siteCreateSchema } from "../packages/shared/src/schemas";

describe("Shared Schemas", () => {
  describe("loginSchema", () => {
    it("should validate valid login data", () => {
      const validData = { email: "test@example.com", password: "password123" };
      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const invalidData = { email: "invalid", password: "password123" };
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject short password", () => {
      const invalidData = { email: "test@example.com", password: "123" };
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("registerSchema", () => {
    it("should validate valid registration data", () => {
      const validData = {
        name: "Test User",
        email: "test@example.com",
        phone: "01712345678",
        password: "password123",
      };
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject short phone number", () => {
      const invalidData = {
        name: "Test User",
        email: "test@example.com",
        phone: "123",
        password: "password123",
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("siteCreateSchema", () => {
    it("should validate valid site creation data", () => {
      const validData = {
        name: "Test Site",
        subdomain: "test-site",
        description: "A test site",
        websiteType: "ECOMMERCE",
      };
      const result = siteCreateSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate different website types", () => {
      const websiteTypes = ["ECOMMERCE", "PORTFOLIO", "BLOG", "CORPORATE", "RESTAURANT", "EDUCATION", "LANDING"];
      websiteTypes.forEach((websiteType) => {
        const data = {
          name: "Test",
          subdomain: "test",
          websiteType,
        };
        const result = siteCreateSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid subdomain", () => {
      const invalidData = {
        name: "Test",
        subdomain: "Invalid Subdomain!",
        websiteType: "ECOMMERCE",
      };
      const result = siteCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
