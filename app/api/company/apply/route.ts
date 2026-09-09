import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const applicationSchema = z.object({
  companyLegalName: z.string().min(2).max(255),
  registrationNumber: z.string().min(1).max(100),
  websiteUrl: z.string().optional(),
  authorizedRepName: z.string().min(2).max(100),
  contactEmail: z.string().email(),
  contactPhone: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const data = {
      companyLegalName: formData.get("companyLegalName")?.toString() || "",
      registrationNumber: formData.get("registrationNumber")?.toString() || "",
      websiteUrl: formData.get("websiteUrl")?.toString() || "",
      authorizedRepName: formData.get("authorizedRepName")?.toString() || "",
      contactEmail: formData.get("contactEmail")?.toString() || "",
      contactPhone: formData.get("contactPhone")?.toString() || "",
    };

    const validatedData = applicationSchema.parse(data);
    const idFile = formData.get("idFile") as File;

    if (idFile) {
      console.log("File received:", idFile.name, idFile.size);
    }

    console.log("Application submitted:", validatedData);

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully",
      applicationId: `APP-${Date.now()}`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid form data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process application" },
      { status: 500 }
    );
  }
}
