import { z } from 'zod';

export const farmSchema = z.object({
  farm_name: z.string().min(2, 'Farm name must be at least 2 characters').max(80, 'Farm name is too long'),
  location: z.string().min(2, 'Location is required').max(120, 'Location is too long'),
  soil_type: z.string().max(60, 'Soil type is too long').optional().or(z.literal('')),
  farm_size: z
    .union([z.coerce.number().positive('Farm size must be greater than 0'), z.literal('')])
    .optional(),
  water_source: z.string().max(60, 'Water source is too long').optional().or(z.literal('')),
});

export type FarmFormValues = z.infer<typeof farmSchema>;
