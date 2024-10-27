import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import {ConfigService} from "@nestjs/config";
import { validate } from '@telegram-apps/init-data-node';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
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
        validate(authData, token, {expiresIn: 0});
        return true;
      } catch (e) {
        return false;
      }
    default:
      return false;
  }
}
