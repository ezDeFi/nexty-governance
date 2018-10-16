import {createContainer} from '@/util'
import Component from './Component'
import NTFToken from '@/service/NTFToken'
import NextyManager from '@/service/NextyManager'

export default createContainer(Component, (state) => {
    return {
        ...state.user
    }
}, () => {
    const ntfService = new NTFToken()
    const managerService = new NextyManager()

    return {
        /*
        async getFund() {
            return await contractService.getFund()
        },
        async getFundBonus() {
            return await contractService.getFundBonus()
        },
        async getPackagesInfo() {
            return await contractService.getPackagesInfo()
        }
        */
    }
})
