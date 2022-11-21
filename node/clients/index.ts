import { IOClients } from '@vtex/api'

import Status from './status'
import Universities from './universities'

// Extend the default IOClients implementation with our own custom clients.
export class Clients extends IOClients {
  public get status() {
    return this.getOrSet('status', Status)
  }

  public get universities() {
    return this.getOrSet('universities', Universities)
  }
}
