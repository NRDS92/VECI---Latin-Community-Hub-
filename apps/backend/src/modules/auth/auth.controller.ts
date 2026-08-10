import { Request, Response } from "express";
import * as authService from "./auth.service";
import { catchAsync } from "../../utils/catchAsync";



export const getMe = catchAsync(
    async (req: any, res: Response) => {

        const user = await authService.getCurrentUser(
            req.user.id
        );

        res.json({
            success: true,
            data: user,
        });

    }
);


export const register = catchAsync(async (req: Request, res: Response) => {
  const user = await authService.registerUser(req.body);

  res.status(201).json({
    success: true,
    data: user,
  });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.loginUser(req.body);

  res.json({
    success: true,
    data: result,
  });
});

export const googleLogin = catchAsync(
  async (req: Request, res: Response) => {

    const { idToken } = req.body;

    const result = await authService.loginWithGoogle(idToken);

    res.json({
      success: true,
      data: result,
    });

  }
  
);

export const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const token = Array.isArray(req.params.token)
  ? req.params.token[0]
  : req.params.token;

  await authService.verifyEmailToken(token);

  res.send("✅ Email verified successfully!");
});


export const deleteAccount = catchAsync(async (req: any, res: Response) => {
  await authService.deleteUserAccount(req.user.id);

  res.json({
    success: true,
    message: "Account deleted successfully",
  });
});

export const forgotPassword = catchAsync(
  async (req: Request, res: Response) => {

    const { email } = req.body;

    await authService.forgotPassword(email);

    res.json({
      success: true,
      message:
        "If an account with this email exists, you will receive password reset instructions.",
    });

  }
);

export const resetPassword = catchAsync(
  async (req: Request, res: Response) => {
    const { token, password } = req.body;

    await authService.resetPassword(token, password);

    res.json({
      success: true,
      message: "Password updated successfully.",
    });
  }
);