> **Goal** 🚀
> 
> Make a request to an external API and return the response to the client using a VTEX service and middlewares in Node.js

## manifest.json

To make a request to an internal or external API, you need to add a policy with **outbound-access** for external and **inbound-access** for internal requests.

```json
  {
    "name": "outbound-access",
    "attrs": {
      "host": "universities.hipolabs.com",
      "path": "/*"
    }
  },
```

## node/service.json

To create new endpoints, you need to add the name inside **routes** object as a property. The key of this object is an ID to identify the endpoint.

```json
  "universities": {
    "path": "/universities",
    "public": true,
  }
```

## node/middlewares/getUniversities.ts

This function is responsible for making the request to the external API by calling the method **getUniversitiesByCountry** method (**clients/universities.ts**) and returning a response to the client.

```typescript
export async function getUniversities(ctx: Context, next: () => Promise<any>) {
  const {
    vtex: {
      route: { params },
    },
  } = ctx

  console.info('Received params:', params)

  const { country } = params

  console.info('Received country:', country)

  const universitiesResponse = await ctx.clients.universities.getUniversitiesByCountry(
    country
  )

  console.info('Received universitiesResponse:', universitiesResponse)

  if (universitiesResponse.status === 200) {
    ctx.body = universitiesResponse.data
  } else {
    ctx.body = 'No universities found'
  }

  await next()
}
```

## node/clients/universities.ts

This class will be called by the **getUniversities** *middleware* when we make a request to the endpoint **/universities**. The external API url is set in the super constructor and we define the method **getUniversitiesByCountry** to get the list of universities by country.

```typescript

import type { InstanceOptions, IOContext, IOResponse } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

export default class Universities extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super('http://universities.hipolabs.com/', context, options)
  }

  public async getUniversitiesByCountry(
    country: string | string[]
  ): Promise<IOResponse<string>> {
    return this.http.getRaw(`search?country=${country}`)
  }
}
```

## node/index.ts

In this file, we define the routes with their REST verbs and the middlewares that will be called when we make a request to the endpoint. The name of this route needs to be the same as the name of the ID of the endpoint in the **service.json** file.

```typescript
import type { ClientsConfig, RecorderState, ServiceContext } from '@vtex/api'
import { LRUCache, method, Service } from '@vtex/api'

import { Clients } from './clients'
import { getUniversities } from './middlewares/getUniversities'
import { status } from './middlewares/status'
import { validate } from './middlewares/validate'

const TIMEOUT_MS = 800

// Create a LRU memory cache for the Status client.
// The @vtex/api HttpClient respects Cache-Control headers and uses the provided cache.
const memoryCache = new LRUCache<string, any>({ max: 5000 })

metrics.trackCache('status', memoryCache)

// This is the configuration for clients available in `ctx.clients`.
const clients: ClientsConfig<Clients> = {
  // We pass our custom implementation of the clients bag, containing the Status client.
  implementation: Clients,
  options: {
    // All IO Clients will be initialized with these options, unless otherwise specified.
    default: {
      retries: 2,
      timeout: TIMEOUT_MS,
    },
    // This key will be merged with the default options and add this cache to our Status client.
    status: {
      memoryCache,
    },
  },
}

declare global {
  // We declare a global Context type just to avoid re-writing ServiceContext<Clients, State> in every handler and resolver
  type Context = ServiceContext<Clients, State>

  // The shape of our State object found in `ctx.state`. This is used as state bag to communicate between middlewares.
  interface State extends RecorderState {
    code: number
  }
}

// Export a service that defines route handlers and client options.
export default new Service({
  clients,
  routes: {
    // `status` is the route ID from service.json. It maps to an array of middlewares (or a single handler).
    status: method({
      GET: [validate, status],
    }),

    universities: method({
      GET: [getUniversities],
    }),
  },
})
```
