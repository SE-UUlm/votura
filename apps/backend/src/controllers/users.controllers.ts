import { type Request, type Response } from 'express';
//import { findUserById, getUserByEmail, createUser } from '../services/users.service.js';
import { getUserByEmail, createUser } from '../services/users.service.js';
import { hashPassword } from '../utils/hash.js';
import { type User } from '../../generated/prisma/index.js';

//export interface GetUserByIdParams {
//  id: string;
//}
//
//export const getUsers = async (req: Request, res: Response): Promise<void> => {
//  res.sendStatus(501);
//};
//
//export const getUserById = async (
//  req: Request<GetUserByIdParams>,
//  res: Response,
//): Promise<void> => {
//  const id = req.params.id;
//
//  if (id === '') {
//    res.status(400).json({ message: 'Invalid user id.' });
//    return;
//  }
//
//  const user = await findUserById(id);
//
//  if (!user) {
//    res.status(404).json({ message: 'User not found' });
//    return;
//  }
//
//  res.status(200).json(user);
//};


const EMAIL_REGEX: RegExp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
const PASSWORD_REGEX: RegExp = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{12,}$/;

export interface UserSignupRequestBody {
  email: string;
  password: string;
}

/**
 * POST /users/user
 *
 * Expects JSON body: { email: string, password: string }
 * - Validates presence of both fields
 * - Checks uniqueness of email
 * - Hashes password (Argon2id + pepper)
 * - Inserts new User row in the database
 * - Returns 201 with { id, email, createdAt }
 */
export async function signup(
  req: Request<UserSignupRequestBody>,
  res: Response,
): Promise<void> {
  try {
    const { email, password }: UserSignupRequestBody = req.body;

    // Validate email and password
    if (typeof email !== "string" || email.trim() === "" ||
        typeof password !== "string" || password.trim() === "")
    {
      res.status(400).json({
        message: "Email and password must both be strings.",
      });
      return;
    }

    if (
      email.length < 5 ||
      email.length > 256 ||
      !EMAIL_REGEX.test(email)
    ) {
      res.status(400).json({
        message: "Email does not meet required format. It must be a valid email address between 5 and 256 characters long.",
      });
      return;
    }

    if (
      password.length < 12 ||
      password.length > 128 ||
      !PASSWORD_REGEX.test(password)
    ) {
      res.status(400).json({
        message: "Password does not meet required strength policy. It must be at least 12 characters long, contain at least one uppercase letter, one lowercase letter, one digit, and one special character.",
      });
      return;
    }

    // Check if email already exists
    const existingUser: User | null = await getUserByEmail(email);
    if (existingUser) {
      res.status(409).json({
        message: "The user already exists.",
      });
      return;
    }

    //const passwordHash: string = await hashPassword(password);
    //await createUser(email, passwordHash);
    await createUser(email, password);

    res.status(201).json({
      message: "Please check your email to verify your account.",
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error. This should not happen, please report the issue.",
    });
  }
}