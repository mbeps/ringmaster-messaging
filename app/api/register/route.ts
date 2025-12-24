import bcrypt from "bcryptjs"; // Changed from "bcrypt"
import prisma from "@/libs/prismadb";
import { NextResponse } from "next/server";
import { RegisterSchema } from "@/schema/RegisterSchema";
import { ZodError } from "zod";

/**
 * A post request route for registering a new user.
 *
 * @param request (Request): email, name, password for registration
 * @returns (NextResponse): user object or error
 */
export async function POST(request: Request) {
  try {
    // get the body of the request
    const body = await request.json();
    
    // Validate request body using Zod schema
    const { email, name, password } = RegisterSchema.parse(body);

    // hashes the password with 10 rounds of salting (consistent with bcryptjs)
    const hashedPassword = await bcrypt.hash(password, 10);

    // create a new user in the database with the provided email, name, and hashed password
    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
      },
    });

    // return the user object
    return NextResponse.json(user);
  } catch (error: any) {
    if (error instanceof ZodError) {
      return new NextResponse(error.errors[0].message, { status: 400 });
    }
    return new NextResponse(error.message, { status: 500 });
  }
}