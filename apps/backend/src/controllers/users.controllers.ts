import type { Request, Response } from 'express';
import { findUserBy } from '../services/users.service.js';

export interface GetUserByIdParams {
  id: string;
}

export const getUsers = (req: Request, res: Response): void => {
  res.sendStatus(501);
};

export const getUserById = async (
  req: Request<GetUserByIdParams>,
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

  const user = await findUserBy({
    id: id,
  });

  if (!user) {
    res.status(404).json({ message: 'User not found' });
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