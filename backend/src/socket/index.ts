import Socket from './Socket'

let socket

export default class {
    static async create(server) {
        if (!socket) {
            socket = new Socket()
            await socket.start(server)
        }
        return socket
    }
}
