import 'server-only'; // <-- ensure this file cannot be imported from the client

import { createTRPCContext } from '@/server/api/context';
import { appRouter } from '@/server/api/root';
import { createCallerFactory } from '@/server/api/trpc';
import { createHydrationHelpers } from '@trpc/react-query/rsc';
import { cache } from 'react';
import { makeQueryClient } from './query-client';

// IMPORTANT: Create a stable getter for the query client that
//            will return the same client during the same request.
export const getQueryClient = cache(makeQueryClient);

const caller = createCallerFactory(appRouter)(createTRPCContext);

export const { trpc, HydrateClient } = createHydrationHelpers<typeof appRouter>(
    caller,
    getQueryClient,
);