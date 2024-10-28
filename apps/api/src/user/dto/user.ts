import {z} from "zod";

export const CompleteProfileSchema = z.object({
  typeOfWork: z.string(),
  companyName: z.string(),
  workTitle: z.string(),
  workDescription: z.string(),
});

export type CompleteProfilePayload = z.infer<typeof CompleteProfileSchema>;

