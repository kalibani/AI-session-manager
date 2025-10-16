export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export async function onRequestError(
  err: unknown,
  request: {
    path: string;
  },
  context: {
    routerKind: "Pages Router" | "App Router";
  }
) {
  // Dynamically import Sentry to avoid loading it in all runtimes
  const Sentry = await import("@sentry/nextjs");

  // Capture the error with additional context
  Sentry.captureException(err, {
    tags: {
      path: request.path,
      routerKind: context.routerKind,
    },
  });
}
