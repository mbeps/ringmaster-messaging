import bcrypt from "bcrypt";

import prisma from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

/**
 * Checks if the password meets the following requirements:
 * - at least 8 characters long
 * - at least 1 number
 * - at least 1 special character
 * - at least 1 capital letter
 * - at least 1 lower case letter
 *
 * If the password does not meet the requirements, an error is thrown.
 *
 * @param password (string): password to be checked
 */
async function checkPassword(password: string) {
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }
  if (!/\d/.test(password)) {
    throw new Error("Password must contain at least 1 number");
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    throw new Error("Password must contain at least 1 special character");
  }
  if (!/[A-Z]/.test(password)) {
    throw new Error("Password must contain at least 1 capital letter");
  }
  if (!/[a-z]/.test(password)) {
    throw new Error("Password must contain at least 1 lower case letter");
  }
}

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
    // destructuring the body to get the email, name, and password
    const { email, name, password } = body;

    // Password check
    await checkPassword(password);

    // hashes the password with 12 rounds of salting
    const hashedPassword = await bcrypt.hash(password, 12);

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
    console.log("ERROR: Registration Unsuccessful", error);
    return new NextResponse(error.message, { status: 500 });
  }
}
