export function httpError(message: string, status: number): Error {
  return Object.assign(new Error(message), { status });
}

export function statusOf(err: unknown): number {
  if (err && typeof err === "object" && "status" in err) {
    return Number((err as { status: number }).status) || 500;
  }
  return 500;
}
