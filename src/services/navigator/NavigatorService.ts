import type {
  AIProvider,
  NavigatorRequest,
} from "@/types/navigator";

export class NavigatorService {
  constructor(
    private readonly provider: AIProvider
  ) {}

  async *generateResponse(
    request: NavigatorRequest,
    signal: AbortSignal
  ): AsyncIterable<string> {
    yield* this.provider.streamText(request, signal);
  }
}
