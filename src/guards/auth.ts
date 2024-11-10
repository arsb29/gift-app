import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import {ConfigService} from "@nestjs/config";
import {Reflector} from "@nestjs/core";
import {IS_PUBLIC_KEY} from "../decorators/public";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private reflector: Reflector
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    return validateRequest({request, token: this.configService.get('TELEGRAM_BOT_TOKEN')});
  }
}

type Options = {
  request: any,
  token: string
}

function validateRequest(options: Options) {
  const {request, token} = options;
  const [authType, authData = ''] = (request.header('authorization') || '').split(' ');
  switch (authType) {
    case 'tma':
      try {
        // validate(authData, token, {expiresIn: 0});
        return true;
      } catch (e) {
        return false;
      }
    default:
      return false;
  }
}
