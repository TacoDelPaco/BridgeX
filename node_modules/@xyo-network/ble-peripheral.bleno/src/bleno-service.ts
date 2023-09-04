import { PrimaryService, Characteristic } from '@xyo-network/bleno'
import { IXyoMutableCharacteristic } from '@xyo-network/ble-peripheral';
import { IXyoBluetoothPeripheral, IXyoMutableDescriptor, IXyoMutableService } from '@xyo-network/ble-peripheral'
import { BlenoCharacteristic } from './bleno-characteristic';


export class BlenoService implements IXyoMutableService {
    public service: PrimaryService

    get uuid (): string {
        return this.service.uuid
    }

    characteristics: IXyoMutableCharacteristic[] 
    
    constructor(uuid: string, characteristics: BlenoCharacteristic[] ) {
        const blenoChars = characteristics.map((item) => {
            return item.characteristic
        })

        const createdService: PrimaryService = {
            uuid,
            characteristics: blenoChars
        }

        this.service = createdService
        this.characteristics = characteristics
    }

}