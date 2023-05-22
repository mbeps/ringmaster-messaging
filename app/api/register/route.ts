import bcrypt from "bcrypt";

import prisma from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

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
    return new NextResponse("Internal Error", { status: 500 });
  }
}
