// Deno requires the explicit TypeScript extension; the application compiler does not emit this entrypoint.
// @ts-expect-error Deno module resolution differs from the application build.
import { createHandler } from './handler.ts';

declare const Deno: { env: { get(name: string): string | undefined }; serve(handler: (req: Request) => Promise<Response>): void };

const publicKey: JsonWebKey = {
  kty: 'EC', crv: 'P-256',
  x: 'dQxa9ZSilM38jDWfzj7BA5a-Uc9CQ80HP_qlikQB5os',
  y: 'jm7qeufxD4Tt1xPmDMkMamQwQrgdroIcUxz97wY46YU',
};

// Only a public verification key is deployed. Supabase's database credential
// stays in its injected Edge environment; Sites holds its own private signer.
Deno.serve(createHandler({ publicKey, env: (name) => Deno.env.get(name) }));
