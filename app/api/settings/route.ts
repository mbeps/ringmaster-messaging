import { NextResponse } from "next/server";
import { ZodError } from "zod";
import getCurrentUser from "@/actions/getCurrentUser";
import { getLogger } from "@/lib/logger";
import prisma from "@/libs/prismadb";
import { SettingsSchema } from "@/schema/SettingsSchema";

const log = getLogger(["app", "api", "settings"]);

/**
 * A post request route for updating the user's settings (name and image).
 * The user must be logged in to update their settings.
 *
 * @param request (Request): the new name and image of the user
 * @returns (NextResponse): the updated user with the new name and image or an error
 */
export async function POST(request: Request) {
  try {
    // get current user who is logged in (updates their settings)
    const currentUser = await getCurrentUser();
    const body = await request.json();
    // extract the name and image from the body of the request
    const { name, image } = SettingsSchema.parse(body);

    // if the current user is not logged in, return an error
    if (!currentUser?.id) {
      log.warn("Unauthorized attempt to update settings");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // find the user using the current user's ID and updates the name and image fields
    const updatedUser = await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        image: image,
        name: name,
      },
    });

    log.info("Settings updated successfully (userId: {userId})", {
      userId: currentUser.id,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    if (error instanceof ZodError) {
      log.warn("Settings validation failed: {message}", {
        message: error.issues[0]?.message,
      });
      return new NextResponse(error.issues[0].message, { status: 400 });
    }
    log.error("Failed to update settings: {error}", {
      error: error instanceof Error ? error.message : String(error),
    });
    return new NextResponse("Error", { status: 500 });
  }
}
