// GET: Lấy dữ liệu.
// POST: Tạo mới dữ liệu
// PUT: Update dữ liệu
// DELETE: Xóa

//////////////////////////////////////////////////////////////////////////////////////////////////////
/*
    DANGER TEST

/api/user/test
post
params: null
desc: get 1000 faucet all chains

*/

#Balance
/api/balance/get
get
params: null
desc: return balances, which user has
res this.DB_Balance.getDBInstance().find({user: this.currentUser._id}).populate("chain", '-endpoint')

/api/balance/update
put
params: null
desc: scan last 50 latest txs to wallet on server
res: 'ok'

/api/balance/withdraw
post
params: [chain, to, amount]
desc: cash out, for big amount, admin will need to comfirm before coin sending(coming soon)
res: {transactionHash: hash}

/api/balance/get_cash_in
get
params: [chain, skip, limit]
desc: get latest cashIns list, all params are optional. skip default =  0, limit default = 50
res: list:[CashIn Objects], total

/api/balance/get_cash_out
get
params: [chain, skip, limit]
desc: get latest cashOuts list, all params are optional. skip default =  0, limit default = 50
res: list:[CashOut Objects], total

//////////////////////////////////////////////////////////////////////////////////////////////////////
#Chain
/api/chain/list
get
params: null
desc: return all chains
res: [
    {
    endpoint: {type: Object, unique: true},
    api: {type: Object},
    name: {type:String, unique: true},
    symbol: {type:String,  unique: true},
    decimal: {type: Number, default: 18},
    logo: {type: String},
    isActive: {type: Boolean, default: false},
    gas: {type: String, default: '21000'},
    gasPrice: {Object}, // 10 gwei,
    fee: {Object},
    wallet: ...,

    cmc_id: {type: Number, unique: true},
    cmc_rank: {type: Number},
    cmc_price: {type: String}
}
]

#User
/api/user/auto-create
post
params: null
desc: auto create account
res: {
    object user,
    privateKey
}

/api/user/login
post
params: privateKey
desc:
res: {
    object user
}

#dice

/api/dice/bet
post
params: chain, team, amount
desc: create a bet
res: {
    diceRound: {type: Schema.Types.ObjectId, ref: 'diceRound'},
    user: {type: Schema.Types.ObjectId, ref: 'user'},
    value: {type: String},
    team: {type: Boolean},
    status: {type: String, default: diceConstant.BET_STATUS.ACCEPTED}
}

/api/dice/leave
delete
params: chain
desc: leave current round by chain, if not started else throw err
res: 'ok'

/api/dice/get_current_round
get
params: chain
desc: get the current round (by chain) informations
res:
{ 
    round: {
        chain: {type: Schema.Types.ObjectId, ref: 'chain'},
        secretHash: {type: Schema.Types.ObjectId, ref: 'secret'}, 
        roundId: {type: Number},
        startTime: {type: Date, default: new Date()},
        endTime: {type: Date},
        duration: {type: Number},
        status: {type: String, default: diceConstant.ROUND_STATUS.CREATED},

        keyBlock: {type: Number},
        blockHash: {type: String},
        result: {type: Number},
        // sorted by last update
    },
    bets: {
        'BIG': [bet Objects],
        'SMALL': [bet Objects]
    }
}

/api/dice/get_current_bets
get
params: chain
desc: get bets in current round (by chain) informations
res: {
    chain: {type: Schema.Types.ObjectId, ref: 'chain'},

    bets: {
        'BIG': [bet Objects],
        'SMALL': [bet Objects]
    }
}

/api/dice/get_round_log
get
params: [chain, rId]
desc:   get round detail
        full data
res: diceRound Object

/api/dice/get_round_results
get
params: [chain?, skip, limit, sort=(rId || betSum || playerSum)]
desc:   get round list, all params are optional. skip default =  0, limit default = 20, chain = null -> all chains
        results only
res: list:[diceRound Objects], total

/api/dice/mvps (todo)
get
params: skip, limit, sort: (won_amount || won_games || won_amount_rate || won_games_rate)
res: list:[winners], total

#lucky number(Ln)

/api/ln/bet
post
params: chain, team, numbers
desc: buy a ticket, with numbers
res: {
    lnRound: {type: Schema.Types.ObjectId, ref: 'lnRound'},
    user: {type: Schema.Types.ObjectId, ref: 'user'},
    numberFrom: {type: Number},
    numberTo: {type: Number},
    status: {type: String, default: lnConstant.TICKET_STATUS.ACCEPTED}
}

/api/ln/leave
delete
params: chain
desc: leave current round by chain, if not started else throw err
res: 'ok'

/api/ln/get_current_round
get
params: chain
desc: get the current round (by chain) informations
res:
{ 
    round: {
        chain: {type: Schema.Types.ObjectId, ref: 'chain'},
        hash: {type: String},
        seed: {type: String, default: null},
        roundId: {type: Number},
        startTime: {type: Date},
        endTime: {type: Date},
        status: {type: String, default: lnConstant.ROUND_STATUS.CREATED},
        lnPrice: {type: String},

        keyBlock: {type: Number, default: 0},
        blockHash: {type: String},
        result: {type: Number},

        ticketSum: {type: Number, default: 0},
        numberSum: {type: Number, default: 0},
        playerCount: {type: Number, default: 0}
        // sorted by last update
    },
    tickets: [ticket Objects]
}

/api/ln/get_current_tickets
get
params: chain
desc: get bets in current round (by chain) informations
res: {
    chain: {type: Schema.Types.ObjectId, ref: 'chain'},

    tickets: [ticket Objects]
}

/api/ln/get_round_log
get
params: [chain, rId]
desc:   get round detail
        full data
res: lnRound Object

/api/ln/get_round_results
get
params: [chain?, skip, limit, sort=(rId || ticketSum || numberSum || playerSum)]
desc:   get round list, all params are optional. skip default =  0, limit default = 20, chain = null -> all chains
        results only
res: list:[diceRound Objects], total

/api/ln/mvps (todo)
get
params: skip, limit, sort: (won_amount || won_games || won_amount_rate || won_games_rate)
res: list:[winners], total

