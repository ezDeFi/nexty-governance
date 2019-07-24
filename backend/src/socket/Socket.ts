import * as socketIO from 'socket.io'
import DB from '../db'
import * as _ from 'lodash'

const selectFields = '-salt -password'

export default class {
    protected io:any
    protected db: any

    constructor() {
    }

    public async start(server) {
        this.db = await DB.create()
        this.io = socketIO(server)
        console.log('===== SOCKET CONNECTION ======')

        this.io.on('connection', (socket) => {
            socket.on('EMIT_UPDATE_BALANCE', async (data) => {
                console.log('A user joined payments pool', data)
                socket.join(data)
            })

            socket.on('disconnect', async () => {
                socket.disconnect()
            })

            socket.on('JOIN_DICE', async (data) => {
                socket.join(`DICE_${data.chain}`)
            })

            socket.on('JOIN_LN', async (data) => {
                socket.join(`LN_${data.chain}`)
            })

            this.joinChat(socket)
            this.newMessage(socket)
            this.disConnection(socket)
        })
    }

    public async diceGame(chain, event, data) {
        this.io.to(`DICE_${chain}`).emit(event, data)
    }

    public async lnGame(chain, event, data) {
        this.io.to(`LN_${chain}`).emit(event, data)
    }

    public emitEvent(userId, event) {
        this.io.to(userId).emit(event)
    }

    public async joinChat(socket) {
        const db_user = this.db.getModel('User')
        const db_connection = this.db.getModel('Connection')

        socket.on('CHAT_JOIN', async (param) => {
            const room = param.room || 1

            const connection = await db_connection.save({
                room: room,
                user: param.userId,
                socketId: socket.id
            })

            socket.join(room)

            const connections = await db_connection.getDBInstance().find({room: room}).populate('user')

            const users = _.mapValues(connections, (connection) => {
                return connection.user
            })

            this.io.to(room).emit('CHAT_UPDATE', users)
        })
    }

    private async newMessage(socket) {
        const db_user = this.db.getModel('User')
        const db_message = this.db.getModel('Message')
        const db_connection = this.db.getModel('Connection')

        socket.on('CHAT_NEW_MESSAGE', async (param) => {
            const connection: any = await db_connection.getDBInstance()
                .findOne({socketId: socket.id})
                .populate('user')

            if (!connection) {
                return
            }

            let newMessage = await db_message.save({
                text: param.message,
                user: param.userId,
                room: param.room || 1
            })

            const message = await db_message.getDBInstance().findOne({_id: newMessage._id})
                .populate('user')

            this.io.to(param.room).emit('CHAT_ADD_MESSAGE', message)
        })
    }

    private async disConnection(socket) {
        const db_user = this.db.getModel('User')
        const db_connection = this.db.getModel('Connection')

        socket.on('disconnect', async (data) => {
            console.log('=====DISCONNECT=====', socket.id)

            const connection = await db_connection.getDBInstance()
                .findOne({socketId: socket.id})
                .populate('user')

            if (!connection) {
                return
            }

            await db_connection.findByIdAndDelete(connection._id)
            this.io.to(connection.room).emit('CHAT_REMOVE_USER', connection.user)
        })
    }
}
