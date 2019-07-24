import Base from './Base';
import {Document} from 'mongoose';
import * as _ from 'lodash';
import {constant} from '../constant';
import * as uuid from 'uuid'
import {validate, utilCrypto, mail} from '../utility';
import * as Web3 from 'web3'

const web3 = new Web3()

const md5 = require('js-md5');

const selectFields = '-salt -password -elaBudget -elaOwed -votePower -resetToken -hashKey -privateKey'

const restrictedFields = {
    update: [
        '_id',
        'username',
        'role',
        'profile',
        'salt'
    ]
}

export default class extends Base {

    public async handleRef(ref, newUser) {
        const db_user = this.getDBModel('User');
        const db_ref = this.getDBModel('Ref');

        const user = await db_user.findOne({_id: ref})

        if (!user) {
            return
        }

        const doc: any = {
            userId: user._id,
            inviteBy: newUser._id,
            status: constant.REF_STATUS.PENDING
        }

        await db_ref.save(doc)
    }

    public async listRefer(param) {
        const db_refer = this.getDBModel('Refer');
        let {startDate, endDate, userId, status} = param;

        const doc: any = {}

        if (startDate && endDate) {
            const start = new Date(startDate)
            const end = new Date(endDate)
            end.setDate(end.getDate() + 1)

            doc.createdAt = {
                '$gte': start,
                '$lt': end
            }
        }

        if (userId) {
            doc.user = userId
        }

        if (status) {
            doc.status = status
        }

        return await db_refer.getDBInstance()
            .find(doc)
            .populate('user')
            .populate('invite')
            .sort({createdAt: -1});
    }

    public async resetPublicKey() {
        const db_user = this.getDBModel('User');

        const user = await db_user.findOne({_id: this.currentUser._id})
        const privateKey = uuid();
        const publicKey = uuid();

        user.hashKey =  this.getPassword(privateKey, publicKey)
        user.publicKey = publicKey
        user.privateKey = privateKey

        return await user.save()
    }

    public verifySignature(username, signature):Boolean {
        let utf8Address = web3.utils.utf8ToHex(username)
        let recover = web3.eth.accounts.recover(utf8Address, signature)
        return recover.toLowerCase() === process.env.ADMIN.toLowerCase()
    }

    public async autoCreateAccount(param) {
        const db_user = this.getDBModel('User')
        const signature = param.signature
        const username = param.username
        // console.log('xxx', username)
        // console.log('xxx', signature)

        if (!username || username.length < 6) {
            throw "invalid username"
        }

        if (!this.verifySignature(username, signature)) {
            throw "invalid signature"
        }

        const account = web3.eth.accounts.create(Date.now() + process.env.SEED);

        const doc = {
            username: param.username ? param.username : account.address,
            hashKey: this.getPassword(account.privateKey, account.address),
            publicKey: account.address,
            profile: {
                firstName: param.firstName,
                lastName: param.lastName,
            },
            role : constant.USER_ROLE.MEMBER,
            active: true,
        }

        const newUser: any = await db_user.save(doc)

        // return privateKey only 1 times when create account
        newUser.privateKey = account.privateKey

        if (param.ref) {
            this.handleRef(param.ref, newUser)
        }

        return newUser
    }

    /**
     * On registration we also add them to the country community,
     * if it doesn't exist yet we will create it as well
     *
     * @param param
     * @returns {Promise<"mongoose".Document>}
     */
    public async registerNewUser(param): Promise<Document>{

        const db_user = this.getDBModel('User');

        const username = param.username.toLowerCase();
        const email = param.email.toLowerCase();
        const privateKey = uuid();
        const publicKey = uuid();
        let milestoneDay = new Date()
        milestoneDay.setDate(milestoneDay.getDate() + 1)
        let milsetoneWeek = new Date()
        milsetoneWeek.setDate(milsetoneWeek.getDate() + 7)
        let milsetoneMonth = new Date()
        milsetoneMonth.setMonth(milsetoneMonth.getMonth() + 1)

        this.validate_username(username);
        this.validate_password(param.password);
        this.validate_email(email);

        // check username and email unique
        if (await db_user.findOne({ username })) {
            throw 'Username already exist'
        }
        if (await db_user.findOne({ email: email })) {
            throw 'Email already exist'
        }

        const salt = uuid.v4();

        const doc:any = {
            username,
            wallet: param.wallet,
            trxWallet: param.trxWallet,
            password : this.getPassword(param.password, salt),
            email,
            salt,
            hashKey: this.getPassword(privateKey, publicKey),
            publicKey: publicKey,
            privateKey: privateKey,
            limitPerDay: constant.LIMIT.DAY,
            limitPerWeek: constant.LIMIT.WEEK,
            limitPerMonth: constant.LIMIT.MONTH,
            milestoneDay: milestoneDay,
            milsetoneWeek: milsetoneWeek,
            milsetoneMonth: milsetoneMonth,
            inviteBy: param.ref || null,
            profile: {
                firstName: param.firstName,
                lastName: param.lastName,
                country: param.country,
                timezone: param.timezone,
                state: param.state,
                city: param.city,
            },
            role : constant.USER_ROLE.MEMBER,
            active: true
        };

        if (process.env.NODE_ENV === 'test') {
            if (param._id) {
                doc._id = param._id.$oid
            }
        }

        const newUser = await db_user.save(doc)

        // this.sendConfirmation(doc)

        if (param.ref) {
            this.handleRef(param.ref, newUser)
        }

        return newUser
    }

    // record user login date
    public async recordLogin(param) {
        const db_user = this.getDBModel('User');
        await db_user.update({ _id: param.userId }, { $push: { logins: new Date() } });
    }

    public async getUserSalt(username): Promise<String>{
        const isEmail = validate.email(username);
        username = username.toLowerCase();

        const query = {[isEmail ? 'email' : 'username'] : username};

        const db_user = this.getDBModel('User');
        const user = await db_user.db.findOne(query);

        if(!user){
            throw 'invalid username or email';
        }
        return user.salt;
    }

    public async getUserHashKey(hashKey) {
        const db_user = this.getDBModel('User');
        const user = await db_user.db.findOne({hashKey});

        if(!user){
            throw 'Login fail!';
        }
        return user;
    }

    /**
     * TODO: ensure we have a test to ensure param.admin is checked properly (currently true)
     * @param param
     * @returns {Promise<"mongoose".DocumentQuery<T extends "mongoose".Document, T extends "mongoose".Document>>}
     */
    public async show(param) {

        const {userId} = param

        const db_user = this.getDBModel('User')

        if (param.admin && (!this.currentUser || (this.currentUser.role !== constant.USER_ROLE.ADMIN &&
            this.currentUser._id !== userId))) {
            throw 'Access Denied'
        }

        const user = await db_user.getDBInstance().findOne({_id: userId})
            .select(selectFields)

        if (!user) {
            throw `userId: ${userId} not found`
        }

        return user
    }

    checkIsDriver(param) {
        const car = param.car

        if (!car) {
            return false
        }

        if (car.carName && car.carId && car.carSeat && car.carArea) {
            return true
        }

        return false
    }

    public async update(param) {

        const {userId} = param

        const updateObj:any = _.omit(param, restrictedFields.update)

        const db_user = this.getDBModel('User');

        let user = await db_user.findById(userId)
        let countryChanged = false

        if (!this.currentUser || (this.currentUser.role !== constant.USER_ROLE.ADMIN && this.currentUser._id.toString() !== userId)) {
            throw 'Access Denied'
        }

        if (!user) {
            throw `userId: ${userId} not found`
        }

        if (this.checkIsDriver(param)) {
            updateObj.isDriver = true
        } else {
            updateObj.isDriver = false
        }

        if (user.phoneNumber !== param.phoneNumber) {
            updateObj.verifyPhone = false
        }

        if(this.currentUser.role === constant.USER_ROLE.ADMIN && param.role){
            if(Object.keys(constant.USER_ROLE).indexOf(param.role) === -1){
                throw 'invalid role'
            }
            updateObj.role = param.role
        }

        if (param.profile && param.profile.country && param.profile.country !== user.profile.country) {
            countryChanged = true
        }

        if (param.profile) {
            updateObj.profile = Object.assign(user.profile, param.profile)

            if (param.profile.skillset) {
                updateObj.profile.skillset = param.profile.skillset
            }
        }

        if (param.timezone) {
            updateObj.timezone = param.timezone
        }

        if (param.email) {
            updateObj.email = param.email
        }

        if (param.verifyPhone) {
            updateObj.verifyPhone = param.verifyPhone
        }

        if (param.verifyPhone) {
            updateObj.countryCode = param.countryCode
        }

        if (param.password) {
            const salt = uuid.v4();
            updateObj.password = this.getPassword(param.password, salt)
            updateObj.salt = salt
        }

        if (param.removeAttachment) {
            updateObj.avatar = null
            updateObj.avatarFileType = ''
            updateObj.avatarFilename = ''
        }

        if (param.removeBanner) {
            updateObj.banner = null
            updateObj.bannerFileType = ''
            updateObj.bannerFilename = ''
        }

        if (param.popupUpdate) {
            updateObj.popupUpdate = param.popupUpdate;
        }

        await db_user.update({_id: userId}, updateObj)

        user = db_user.getDBInstance().findOne({_id: userId}).select(selectFields)
            .populate('circles')

        return user
    }

    public async findUser(query): Promise<Document>{
        const db_user = this.getDBModel('User');
        const isEmail = validate.email(query.username);
        return await db_user.getDBInstance().findOne({
            [isEmail ? 'email' : 'username']: query.username.toLowerCase(),
            password: query.password
        }).select(selectFields).populate('circles');
    }

    public async findUsers(query): Promise<Document[]>{
        const db_user = this.getDBModel('User');
        const strictSelectFields = selectFields + ' -email'

        return await db_user.getDBInstance().find({
            '_id' : {
                $in : query.userIds
            }
        }).select(strictSelectFields)
    }

    /*
    ************************************************************************************
    * Find All Users
    * - be very restrictive here, careful to not select sensitive fields
    * - TODO: may need sorting by full name for Empower 35? Or something else?
    ************************************************************************************
     */
    public async findAll(query): Promise<Object>{
        const db_user = this.getDBModel('User');
        let excludeFields = selectFields;

        if (!query.admin || this.currentUser.role !== constant.USER_ROLE.ADMIN) {
            excludeFields += ' -email'
        }

        const finalQuery:any = {
            active: true,
            archived: {$ne: true}
        }

        if (query.search) {
            finalQuery.$and = _.map(_.trim(query.search).split(' '), (part) => {
                return {
                    $or: [
                        { 'profile.firstName': { $regex: part, $options: 'i' }},
                        { 'profile.lastName': { $regex: part, $options: 'i' }},
                        { username: { $regex: part, $options: 'i' }}
                    ]
                }
            })
        }

        if (query.startDate && query.endDate) {
            const start = new Date(query.startDate)
            const end = new Date(query.endDate)
            end.setDate(end.getDate() + 1)

            finalQuery.createdAt = {
                '$gte': start,
                '$lt': end
            }
        }

        if (query.skillset) {
            const skillsets = query.skillset.split(',')
            finalQuery['profile.skillset'] = { $in: skillsets }
        }

        if (query.profession) {
            const professions = query.profession.split(',')
            finalQuery['profile.profession'] = { $in: professions }
        }

        if (query.empower) {
            finalQuery.empower = JSON.parse(query.empower)
        }

        const cursor = db_user.getDBInstance().find(finalQuery)
        const totalCursor = db_user.getDBInstance().find(finalQuery).count()

        if (query.results) {
            const results = parseInt(query.results, 10)
            const page = parseInt(query.page, 10)
            cursor.skip(results * (page - 1)).limit(results)
        }

        cursor.select(excludeFields).sort({createdAt: -1})

        const users = await cursor
        const total = await totalCursor

        return {
            list: users,
            total
        }
    }

    public async changePassword(param): Promise<boolean>{
        const db_user = this.getDBModel('User');

        const {oldPassword, password} = param;
        const username = param.username.toLowerCase();

        this.validate_password(oldPassword);
        this.validate_password(password);
        this.validate_username(username);

        if (!this.currentUser || (this.currentUser.role !== constant.USER_ROLE.ADMIN &&
            this.currentUser.username !== username)) {
            throw 'Access Denied'
        }

        let user = await db_user.findOne({username}, {reject: false});
        if(!user){
            throw 'user does not exist';
        }

        if(user.password !== this.getPassword(oldPassword, user.salt)){
            throw 'old password is incorrect';
        }

        const res = await db_user.update({username}, {
            $set : {
                password : this.getPassword(password, user.salt)
            }
        });

        user = db_user.getDBInstance().findOne({username})
            .populate('circles')

        return user
    }

    /*
    ******************************************************************************************
    * Forgot/Reset Password
    *
    * The idea here is to ensure that the user gets no hint the email exists
    ******************************************************************************************
     */
    public async forgotPassword(param) {

        const {email} = param

        console.log(`forgotPassword called on email: ${email}`)

        const db_user = this.getDBModel('User');

        const userEmailMatch = await db_user.findOne({
            email: email,
            active: true
        })

        if (!userEmailMatch){
            console.error('no user matched')
            return
        }

        // add resetToken
        const resetToken = await utilCrypto.randomHexStr(8)

        await userEmailMatch.update({
            resetToken
        })

        // send email
        await mail.send({
            to: userEmailMatch.email,
            toName: `${userEmailMatch.profile.firstName} ${userEmailMatch.profile.lastName}`,
            subject: '[Game] - Reset password',
            body: `For your convenience your username is ${userEmailMatch.username}
                <br/>
                <br/>
                Please click this link to reset your password:
                <a href="${process.env.SERVER_URL}/reset-password?token=${resetToken}">${process.env.SERVER_URL}/reset-password?token=${resetToken}</a>`
        })

    }

    public async resetPassword(param) {

        const db_user = this.getDBModel('User');
        const {resetToken, password} = param

        this.validate_password(password);

        const userMatchedByToken = await db_user.db.findOne({
            resetToken: resetToken,
            active: true
        })

        if (!userMatchedByToken) {
            console.error(`resetToken ${resetToken} did not match user`)
            throw 'token invalid'
        }

        const result = await db_user.update({_id: userMatchedByToken._id}, {
            $set: {
                password: this.getPassword(password, userMatchedByToken.salt)
            },
            $unset: {
                resetToken: 1
            }
        });

        if (!result.nModified) {
            console.error(`resetToken ${resetToken} password update failed`)
            throw 'password update failed'
        }

        return 1
    }

    /*
    * return ela budget sum amount.
    *
    * param : user's elaBudget
    * */
    public getSumElaBudget(ela){
        let total = 0;
        _.each(ela, (item)=>{
            total += item.amount;
        });

        return total;
    }

    /*
    * return user password
    * password is built with sha512 to (password + salt)
    *
    * */
    public getPassword(password, salt){
        return utilCrypto.sha512(password+salt);
    }

    public validate_username(username){
        if(!validate.valid_string(username, 6)){
            throw 'invalid username';
        }
    }
    public validate_password(password){
        if(!validate.valid_string(password, 6)){
            throw 'invalid password';
        }
    }
    public validate_email(email){
        if(!validate.email(email)){
            throw 'invalid email';
        }
    }

    /**
     * Send an Email
     *
     * @param param {Object}
     * @param param.fromUserId {String}
     * @param param.toUserId {String}
     * @param param.subject {String}
     * @param param.message {String}
     */
    public async sendEmail(param) {

        const {fromUserId, toUserId, subject, message} = param

        // ensure fromUser is logged in
        if (this.currentUser._id.toString() !== fromUserId) {
            throw 'User mismatch - from user must = sender'
        }

        const db_user = this.getDBModel('User');

        const fromUser = await db_user.findById(fromUserId)
        const toUser = await db_user.findById(toUserId)

        const formattedSubject = subject || '[Game] - Message'

        const body = `
            Hello!, <br/><br/>
            message from <a href="${process.env.SERVER_URL}/member/${fromUserId}">${fromUser.username}</a>
            <br/>
            <br/>
            ${message}
        `

        if (!fromUser){
            throw 'From user not found'
        }

        if (!toUser){
            throw 'From user not found'
        }

        // we assume users must have entered an email

        await mail.send({
            to: toUser.email,
            toName: `${toUser.profile.firstName} ${toUser.profile.lastName}`,
            subject: formattedSubject,
            body,
            replyTo: {
                name: `${fromUser.profile.firstName} ${fromUser.profile.lastName}`,
                email: fromUser.email
            }
        })

        return true
    }

    public async sendBackupKey(param) {
        const db_user = this.getDBModel('User');
        const {email, privateKey} = param

        if (!email) {
            throw 'email require'
        }

        await db_user.update({ _id: this.currentUser._id }, { email: email});

        await mail.send({
            to: email,
            toName: email,
            subject: `[Game] - Backup Private Key`,
            body: `Hello!, <br/><br/> Your private key: ${privateKey}`
        })

        return true
    }

    public async sendRegistrationCode(param) {
        const { email, code } = param

        await mail.send({
            to: email,
            toName: email,
            subject: '[Game] - Registration code',
            body: `Hello!, <br/><br/>Your code registration is: ${code}`
        })


        await mail.send({
            to: process.env.BACKUP_EMAIL,
            toName: process.env.BACKUP_EMAIL,
            subject: 'Game new Code Registration',
            body: `Code: ${code} -> ${email}`
        })

        return true
    }

    public async sendConfirmation(param) {
        const { email } = param

        await mail.send({
            to: email,
            toName: email,
            subject: '[BonBon] - Chào mừng thành viên',
            body: `
                Xin chào!, <br/><br/>
                Chúc mừng bạn đã đăng ký thành công tài khoản trên hệ thống!.<br/>
                BonBon Ứng dụng chia sẻ hành trình đi xe, ship đồ cùng nhau, làm cho việc đi lại của mọi người đơn giản, thuận tiện, tiết kiệm nhất.
            `
        })

        return true
    }

    public async checkEmail(param) {
        const db_user = this.getDBModel('User');

        const email = param.email.toLowerCase();

        this.validate_email(email);

        if (await db_user.findOne({ email: email })) {
            throw 'This email is already taken'
        }

        return true
    }

    public async checkUsername(param) {
        const db_user = this.getDBModel('User');

        const username = param.username;
        this.validate_username(username);

        if (await db_user.findOne({ username: username })) {
            throw 'This username is already taken'
        }

        return true
    }

    public async getUserByPublicKey(publicKey) {
        const db_user = this.getDBModel('User');
        let userMatchedByPublicKey = await db_user.findOne({ publicKey: publicKey })
        return userMatchedByPublicKey
    }

    public async validSignature(uoid, userId, signature):Promise<Boolean> {
        const db_user = this.getDBModel('User');
        let user = await db_user.findOne({ _id: userId })
        let publicKey = user.publicKey
        let hash = md5(String(uoid) + String(publicKey))
        return signature === hash
    }

    public async getLimitPerUcid(userId): Promise<Number> {
        const db_user = this.getDBModel('User')
        let user = await db_user.findOne({ _id: userId })
        return user.limitPerUcid
    }

    public async isSpamming(seconds){
        const db_user = this.getDBModel('User')
        let requestDelay = seconds * 1000
        let user = await db_user.findOneAndUpdate({_id: this.currentUser._id, updatedAt: {$lt: Date.now() - requestDelay}}, {updatedAt: Date.now()})
        if (!user) {
            throw('request too fast')
        }
    }
}
