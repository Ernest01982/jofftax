# Astra continuation release review

Date: 7 October 2026 SAST. Reviewer: Astra Extra High.

**Decision: APPROVED for packaging and owner-only private deployment of the reviewed continuation.** No material blocker was found in this bounded change. The release remains a private preview for validation testing; it is not a claim of complete hosted acceptance, practitioner validation or public/paid readiness.

## Reviewed change

The canonical Sites checkout was recovered at base commit `59770469bafa0535f38204239a05b463996b50f1`. GitHub recovery commit `8fc2d3b690cc03947b750265c2db4560caa85453` identifies that Sites source snapshot. The coordinator independently recovered the successful owner-only v2 deployment through native Sites tooling.

The code change replaces the unconditional Bash `install:ci` command in `package.json` with `scripts/install-pnpm.mjs`. The new dispatcher retains the existing managed Linux helper and enables portable installation through the exact pnpm 11.25.0 JavaScript entrypoint. It preserves the frozen lockfile and caller policies, checks the platform's Vinext executable, and writes the installation marker only after success. Four focused invocation tests cover version rejection, retained host settings/Windows completion, failure propagation/managed dispatch and missing-executable rejection. No application calculator, authentication, storage, schema, migration or dependency-version change is included.

The reviewer inspected this implementation and its final test source, independently ran the four focused tests successfully, and checked the complete working-tree scope. The remaining changes are README and verification/continuation records, including this review. The prior calculator/source manifest remains historical evidence; this document does not claim that its old hash describes the newly added installation files. Packaging must supply the new commit and artifact identity.

## Fresh evidence assessed

| Evidence | Assessment and limit |
| --- | --- |
| Actual Sites dependency installation | Coordinator reports successful Windows installation of 639 packages with pinned pnpm and the frozen lock after network timeouts and cached retries. The dispatcher was exercised through the real Sites helper. |
| Integrated tests, typecheck and production build | Coordinator reports 83 tests passed with zero failures, TypeScript noEmit exit 0, and the exact Sites production build exit 0 on the reviewed code. The reviewer did not independently repeat these full commands. |
| Local calculator/navigation browser evidence | Reviewer read the original and two follow-up JSON reports and the current Playwright harness: 45 unique checks have a final passing result, including all 36 supported fictional examples, actual downloads/clipboard/print output, stale-result invalidation, three-scenario limit, session-storage boundary and calendar export checks. Initial failures remain visible in the original reports; corrected harness assumptions passed without application changes. |
| Local workspace/API/D1 evidence | Reviewer read the nine-check report and harness. Real local UI, API and D1 paths establish both-year save/reload, failed-save retention, stale revision conflict, saved-versus-unsaved export boundaries, and cancellation/confirmed all-year deletion. Identity is the portable development identity, not a genuine hosted visitor. |
| Rendered appearance | Reviewer inspected the supplied desktop landing and 390px mobile result screenshots. The result, assumptions and actions are readable without visible clipping in these views. Automated checks cover five mobile surfaces. This is bounded visual evidence, not exhaustive keyboard, screen-reader or accessibility acceptance. |
| Hosted v2 HTTP checks | Reviewer read nine passing read-only checks through platform service access: five unprotected application surfaces returned 200, three protected APIs returned 401 with private/no-store headers, and the workspace redirected with 307. Service access supplies no visitor identity. These are checks of the recovered v2 deployment, not an assertion that the forthcoming version is already deployed. |

The detailed current register is in [verification-notes.md](verification-notes.md), with the pending hosted matrix in [continuation-status.md](continuation-status.md). Browser reports and screenshots are retained in the replacement-chat workspace under `work/browser-evidence/`; hosted HTTP evidence is `work/hosted-smoke-results.json`. Their local paths are not promises of files embedded in the Git repository.

## Release boundary

The coordinator may now package this unchanged implementation and deploy it using the existing owner-only audience, then record the native result and exact source/artifact identifiers. Documentation-only completion does not require another implementation approval or repeat build. Any further implementation change requires appropriate checks and a new build before deployment.

Genuine hosted sign-in/sign-out, owner persistence, protected identity-bearing HTML behavior, hosted failure/conflict/export/deletion flows and two-real-owner isolation remain pending. An owner-only preview cannot demonstrate a second real owner's access without separately available access and identity. Neither local development identity nor platform service access closes these gates.

The existing bounded calculation contracts remain controlling: 33 calculator/diagnostic entries and three guides; narrower saved preparation; all current functionality free; no active paid service or SARS filing/integration claim. Independent practitioner review and the commercial blueprint's legal, privacy, operational, service and payment gates remain prerequisites to the applicable public/paid launch. No new conversational approval is required for the already authorized private packaging and deployment.
