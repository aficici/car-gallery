import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  role: z.enum(["ADMIN", "SALES_REP"]),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().optional(),
  role: z.enum(["ADMIN", "SALES_REP"]),
  isActive: z.boolean(),
});

export const vehicleSchema = z.object({
  brand: z.string().min(2, "Brand must be at least 2 characters"),
  model: z.string().min(1, "Model is required"),
  year: z.number().int().min(1990, "Year must be 1990 or later").max(new Date().getFullYear() + 1, "Invalid year"),
  color: z.string().min(1, "Color is required"),
  fuelType: z.enum(["GASOLINE", "DIESEL", "ELECTRIC", "HYBRID", "LPG"]),
  transmission: z.enum(["MANUAL", "AUTOMATIC", "SEMI_AUTO"]),
  mileage: z.number().int().min(0, "Mileage cannot be negative"),
  purchasePrice: z.number().min(0, "Purchase price cannot be negative"),
  salePrice: z.number().min(0, "Sale price cannot be negative"),
  status: z.enum(["AVAILABLE", "RESERVED", "SOLD"]).optional(),
  images: z.array(z.string()).optional(),
  description: z.string().max(1000, "Description cannot exceed 1000 characters").optional(),
  plateNumber: z.string().optional().nullable(),
  vin: z.string().optional().nullable(),
});

export const customerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address").optional().nullable(),
  phone: z.string().min(7, "Phone number is required"),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  idNumber: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  occupation: z.string().optional().nullable(),
});

export const contactNoteSchema = z.object({
  type: z.enum(["NOTE", "CALL", "EMAIL", "MEETING", "FOLLOW_UP"]),
  content: z.string().min(1, "Content is required"),
});

export const saleSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  customerId: z.string().min(1, "Customer is required"),
  salePrice: z.number().min(0),
  downPayment: z.number().min(0).optional(),
  paymentMethod: z.enum(["CASH", "CREDIT_CARD", "BANK_TRANSFER", "LOAN", "INSTALLMENT"]),
  commissionRate: z.number().min(0).max(1).optional(),
  notes: z.string().optional().nullable(),
  saleDate: z.string(),
  installments: z.number().int().min(1).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type VehicleInput = z.infer<typeof vehicleSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
export type ContactNoteInput = z.infer<typeof contactNoteSchema>;
export type SaleInput = z.infer<typeof saleSchema>;
