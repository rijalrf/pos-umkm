import { z } from 'zod';

export const getReportSchema = z.object({
  query: z.object({
    startDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
      message: "Invalid start date format",
    }),
    endDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
      message: "Invalid end date format",
    }),
  }),
});

export type GetReportInput = z.infer<typeof getReportSchema>;
