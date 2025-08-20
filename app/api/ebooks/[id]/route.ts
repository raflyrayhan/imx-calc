import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";  // Make sure your prisma instance is correctly imported

// Handle DELETE request to remove a specific ebook by ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;  // Destructure to get the ID from URL params

  try {
    // Check if the eBook exists before attempting deletion
    const ebook = await prisma.ebook.findUnique({ where: { id } });
    if (!ebook) {
      return NextResponse.json({ error: "E-book not found" }, { status: 404 });
    }

    // Proceed with deletion if eBook exists
    await prisma.ebook.delete({
      where: { id }
    });

    // Return success message
    return NextResponse.json({ message: "E-book deleted successfully" });
  } catch (error) {
    // Log the error and return a failure response
    console.error(error);
    return NextResponse.json({ error: "Failed to delete e-book" }, { status: 500 });
  }
}
