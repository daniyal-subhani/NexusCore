import { authProxyService } from '@/services/auth-proxy.service.js';
import type { AsyncRequestHandler } from '@nexus-core/common';
import type {
  LoginInput,
  RefreshInput,
  RegisterInput,
  RevokeInput,
} from '@/validation/auth.schema.js';

export const registerUser: AsyncRequestHandler = async (req, res, next) => {
  try {
    // rely on router-level validation middleware or parse directly if not using middleware
    const payload = req.body as RegisterInput;
    const response = await authProxyService.register(payload);
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const loginUser: AsyncRequestHandler = async (req, res, next) => {
  try {
    const payload = req.body as LoginInput;
    const tokens = await authProxyService.login(payload);
    res.json(tokens);
  } catch (error) {
    next(error);
  }
};

export const refreshTokens: AsyncRequestHandler = async (req, res, next) => {
  try {
    const payload = req.body as RefreshInput;
    const tokens = await authProxyService.refresh(payload);
    res.json(tokens);
  } catch (error) {
    next(error);
  }
};

export const revokeTokens: AsyncRequestHandler = async (req, res, next) => {
  try {
    const payload = req.body as RevokeInput;
    await authProxyService.revoke(payload);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
