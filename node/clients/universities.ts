import type { InstanceOptions, IOContext, IOResponse } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

export default class Universities extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super('http://universities.hipolabs.com/', context, options)
  }

  public async getUniversitiesByCountry(
    country: string | string[]
  ): Promise<IOResponse<any>> {
    return this.http.getRaw(`search?country=${country}`)
  }
}
