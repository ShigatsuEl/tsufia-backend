import { ValidateAuthOutputDto } from '@auth/dtos/validate-auth.dto';

export type RequestWithUser = Request & { user: ValidateAuthOutputDto };

export interface RefreshTokenPayload {
  id: number;
  iat: string;
  exp: string;
}
