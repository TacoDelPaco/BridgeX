
import { IXyoMutableDescriptor, XyoMutablePermissions } from '@xyo-network/ble-peripheral'
import { Descriptor } from '@xyo-network/bleno'

export class BlenoDescriptor implements IXyoMutableDescriptor {
    private descriptor: Descriptor

    get uuid(): string {
        return this.descriptor.uuid
    }

    get permissions(): XyoMutablePermissions[] {
        // todo find way to get permissions
        return []
    }

    constructor (descriptor: Descriptor) {
        this.descriptor = descriptor
    }

}