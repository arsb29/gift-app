import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import {ConfigService} from "@nestjs/config";
import {BotService} from "../bot/bot.service";

type Options = {
  request: Request,
  exception: HttpException
}

function getLog(options: Options) {
  const {
    request,
    exception
  } = options;

  const req = {
    path: request.url,
    body: request.body,
    headers: request.headers,
  };

  const res = {
    status: exception.getStatus(),
    body: exception.getResponse(),
  };

  return `
status <b>${exception.getStatus()} ${new Date().toISOString()} ${request.url}</b>
date <b>${new Date().toISOString()}</b>
url <b>${request.url}</b>

<i>request</i>
<pre>${JSON.stringify(req)}</pre>

<i>response</i>
<pre>${JSON.stringify(res)}</pre>
`;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly configService: ConfigService,
    private readonly botService: BotService
  ) {}
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const message = getLog({request, exception});
    this.botService.sendMessage({message})
      .then(() => {
        console.log('Message sent');
      })
      .catch(err => {
        console.error('Error sending message:', err);
      });
    return response
      .status(status)
      .json(exception.getResponse());
  }
}