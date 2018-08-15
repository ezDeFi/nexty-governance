const expectEvent = require('../../helpers/expectEvent');
const expectThrow = require('../../helpers/expectThrow');
const assertRevert = require('../../helpers/assertRevert');

var NTFToken = artifacts.require('NTFToken');

require('chai')
  .use(require('chai-as-promised'))
  .should();

contract('NTFToken', function (accounts) {
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
  const ZERO_TX = '0x0000000000000000000000000000000000000000000000000000000000000000';

  const [
    owner,
    sender,
    recipient,
    blacklistedAddress1,
    blacklistedAddress2,
    anyone,
  ] = accounts;

  const blacklistedAddresses = [blacklistedAddress1, blacklistedAddress2];

  beforeEach(async function () {
    this.token = await NTFToken.new();
    await this.token.initialize(owner);
  });

  describe('ownership', function () {
    it('should have an owner', async function () {
      let owner_ = await this.token.owner();
      assert.isTrue(owner_ !== 0);
      let holders = await this.token.getHolders();
      assert.equal(holders.length, 1);
      assert.equal(holders[0], owner_);
    });
    
    it('changes owner after transfer', async function () {
      let oldOwner = await this.token.owner();
      await this.token.transferOwnership(anyone);
      let owner_ = await this.token.owner();
    
      assert.isTrue(owner_ === anyone);
      let holders = await this.token.getHolders();
      assert.equal(holders.length, 1);
      assert.equal(holders[0], oldOwner);
    });

    it('should prevent non-owners from transfering', async function () {
      const owner_ = await this.token.owner.call();
      assert.isTrue(owner_ !== recipient);
      await assertRevert(this.token.transferOwnership(recipient, { from: anyone }));
    });

    it('should guard ownership against stuck state', async function () {
      let originalOwner = await this.token.owner();
      await assertRevert(this.token.transferOwnership(null, { from: originalOwner }));
    });
  });

  describe('coinbase', function () {
    it('can set the coinbase', async function () {
      await expectEvent.inTransaction(
        this.token.setCoinbase(recipient, { from: owner }),
        'SetCoinbase'
      );
      const isSealer = await this.token.sealer(owner);
      const coinbase = await this.token.coinbase(recipient);
      let signers = await this.token.getSigners();
      isSealer.should.be.equal(true);
      assert.equal(coinbase, owner);
      assert.equal(signers[0], recipient);
      assert.equal(signers.length, 1);
    });

    it('can remove the coinbase by calling unset method', async function () {
      await expectEvent.inTransaction(
        this.token.setCoinbase(recipient, { from: owner }),
        'SetCoinbase'
      );
      var isSealer = await this.token.sealer(owner);
      var coinbase = await this.token.coinbase(recipient);
      isSealer.should.be.equal(true);
      assert.equal(coinbase, owner);

      // remove coinbase
      await expectEvent.inTransaction(
        this.token.unSetCoinbase(recipient, { from: owner }),
        'UnSetCoinbase'
      );
      isSealer = await this.token.sealer(owner);
      coinbase = await this.token.coinbase(recipient);
      let signers = await this.token.getSigners();
      isSealer.should.be.equal(false);
      assert(coinbase, ZERO_ADDRESS);
      assert.equal(signers.length, 0);
    });

    it('cannot set coinbase if the sender dont hold any NTF token', async function () {
      await assertRevert(this.token.setCoinbase(recipient, { from: sender }));
    });

    it('cannot set coinbase to owner', async function () {
      await assertRevert(this.token.setCoinbase(owner, { from: owner }));
    });

    it('cannot set coinbase to the same address/account with token holder', async function () {
      const amount = 100;
      await expectEvent.inTransaction(
        this.token.transfer(recipient, amount, { from: owner }),
        'Transfer'
      );
      await assertRevert(this.token.setCoinbase(recipient, { from: recipient }));
    });

    it('cannot reset coinbase if already set', async function () {
      await expectEvent.inTransaction(
        this.token.setCoinbase(recipient, { from: owner }),
        'SetCoinbase'
      );
      var isSealer = await this.token.sealer(owner);
      var coinbase = await this.token.coinbase(recipient);
      isSealer.should.be.equal(true);
      assert.equal(coinbase, owner);
      
      // cannot reset
      await assertRevert(this.token.setCoinbase(anyone, { from: owner }));
      let signers = await this.token.getSigners();
      assert.equal(signers[0], recipient);
      assert.equal(signers.length, 1);
    });

    it('can reset coinbase after unset', async function () {
      await expectEvent.inTransaction(
        this.token.setCoinbase(recipient, { from: owner }),
        'SetCoinbase'
      );
      var isSealer = await this.token.sealer(owner);
      var coinbase = await this.token.coinbase(recipient);
      isSealer.should.be.equal(true);
      assert.equal(coinbase, owner);

      // remove coinbase
      await expectEvent.inTransaction(
        this.token.unSetCoinbase(recipient, { from: owner }),
        'UnSetCoinbase'
      );
      isSealer = await this.token.sealer(owner);
      coinbase = await this.token.coinbase(recipient);
      isSealer.should.be.equal(false);
      assert(coinbase, ZERO_ADDRESS);
      
      await expectEvent.inTransaction(
        this.token.setCoinbase(anyone, { from: owner }),
        'SetCoinbase'
      );
      let signers = await this.token.getSigners();
      assert.equal(signers[0], anyone);
      assert.equal(signers.length, 1);
    });

    it('can set coinbase after receiving NTF token', async function () {
      const amount = 100;
      await expectEvent.inTransaction(
        this.token.transfer(recipient, amount, { from: owner }),
        'Transfer'
      );
      await expectEvent.inTransaction(
        this.token.setCoinbase(anyone, { from: recipient }),
        'SetCoinbase'
      );
      const isSealer = await this.token.sealer(recipient);
      const coinbase = await this.token.coinbase(anyone);
      let signers = await this.token.getSigners();
      isSealer.should.be.equal(true);
      assert.equal(coinbase, recipient);
      assert.equal(signers[0], anyone);
      assert.equal(signers.length, 1);
    });
  });

  describe('total supply', function () {
    it('returns the total amount of tokens', async function () {
      const totalSupply = await this.token.totalSupply();
      assert.equal(totalSupply, 10000000 * (10 ** 18));
    });
  });

  describe('token holder', function () {
    it('owner is the first and unique token holder from the beginning', async function () {
      let owner_ = await this.token.owner();
      let holders = await this.token.getHolders();
      assert.equal(holders.length, 1);
      assert.equal(holders[0], owner_);
    });

    it('a new token holder after transfer token succesfully', async function () {
      const amount = 100;
      await expectEvent.inTransaction(
        this.token.transfer(recipient, amount, { from: owner }),
        'Transfer'
      );
      let holders = await this.token.getHolders();
      assert.equal(holders.length, 2);
    });

    it('two new token holders after transfer token succesfully', async function () {
      const amount = 100;
      await expectEvent.inTransaction(
        this.token.transfer(recipient, amount, { from: owner }),
        'Transfer'
      );
      await expectEvent.inTransaction(
        this.token.transfer(sender, amount, { from: owner }),
        'Transfer'
      );

      let holders = await this.token.getHolders();
      assert.equal(holders.length, 3);
    });

    it('some new token holders after transfer token succesfully', async function () {
      const amount = 100;
      await expectEvent.inTransaction(
        this.token.transfer(recipient, amount, { from: owner }),
        'Transfer'
      );
      await expectEvent.inTransaction(
        this.token.transfer(sender, 2 * amount, { from: owner }),
        'Transfer'
      );
      await expectEvent.inTransaction(
        this.token.transfer(recipient, amount, { from: sender }),
        'Transfer'
      );
      // if sender is in blacklist then tnx will be pending
      await this.token.addAddressToBlacklist(sender, { from: owner });
      await expectEvent.inTransaction(
        this.token.transfer(recipient, amount, { from: sender }),
        'PendingTransfer'
      );
      let holders = await this.token.getHolders();
      assert.equal(holders.length, 3);
    });

    it('some new token holders after confirm/transfer token succesfully', async function () {
      const amount = 100;
      await expectEvent.inTransaction(
        this.token.transfer(recipient, amount, { from: owner }),
        'Transfer'
      );
      await expectEvent.inTransaction(
        this.token.transfer(sender, amount, { from: owner }),
        'Transfer'
      );
      // Add sender to blacklist
      await this.token.addAddressToBlacklist(sender, { from: owner });
      await expectEvent.inTransaction(
        this.token.transfer(recipient, amount, { from: sender }),
        'PendingTransfer'
      );
      let pendingReceives = await this.token.getPendingReceives({ from: recipient });
      await expectEvent.inTransaction(
        this.token.confirmTransfer(pendingReceives[0], { from: recipient }),
        'TransferConfirmed'
      );
      let holders = await this.token.getHolders();
      assert.equal(holders.length, 2);
    });
  });

  describe('balanceOf', function () {
    describe('when the requested account has no tokens', function () {
      it('returns zero', async function () {
        const balance = await this.token.balanceOf(anyone);

        assert.equal(balance, 0);
      });
    });
    
    describe('when the requested account has some tokens', function () {
      it('returns the total amount of tokens', async function () {
        const balance = await this.token.balanceOf(owner);

        assert.equal(balance, 10000000 * (10 ** 18));
      });
    });
  });

  describe('blacklist', function () {
    describe('Only onwer can add/remove address to/from blacklist', function () {
      it('should not allow "anyone" to add a address to the blacklist', async function () {
        await expectThrow(
          this.token.addAddressToBlacklist(blacklistedAddress1, { from: anyone })
        );
      });
        
      it('should not allow "anyone" to remove a address from the blacklist', async function () {
        await expectThrow(
          this.token.removeAddressFromBlacklist(blacklistedAddress1, { from: anyone })
        );
      });
    });

    describe('Should add address(es) into blacklist', function () {
      it('should add address to the blacklist', async function () {
        await expectEvent.inTransaction(
          this.token.addAddressToBlacklist(blacklistedAddress1, { from: owner }),
          'BlacklistedAddressAdded'
        );
        const isBlacklisted = await this.token.blacklist(blacklistedAddress1);
        isBlacklisted.should.be.equal(true);
      });
      
      it('should add addresses to the blacklist', async function () {
        await expectEvent.inTransaction(
          this.token.addAddressesToBlacklist(blacklistedAddresses, { from: owner }),
          'BlacklistedAddressAdded'
        );
        for (let addr of blacklistedAddresses) {
          const isBlacklisted = await this.token.blacklist(addr);
          isBlacklisted.should.be.equal(true);
        }
      });
    });
  });

  describe('transfer', function () {
    describe('when the recipient is not the zero address', function () {
      const to = recipient;
        
      describe('when the sender does not have enough balance', function () {
        const amount = 10000001 * (10 ** 18);
            
        it('reverts', async function () {
          await assertRevert(this.token.transfer(to, amount, { from: owner }));
        });
      });
    });

    describe('when the recipient is the zero address', function () {
      const to = ZERO_ADDRESS;
  
      it('reverts', async function () {
        await assertRevert(this.token.transfer(to, 100, { from: owner }));
      });
    });

    describe('when the sender has enough balance', function () {
      const to = recipient;
      const amount = 100;

      it('emits a transfer event', async function () {
        const { logs } = await this.token.transfer(to, amount, { from: owner });

        assert.equal(logs.length, 1);
        assert.equal(logs[0].event, 'Transfer');
        assert.equal(logs[0].args.from, owner);
        assert.equal(logs[0].args.to, to);
        assert(logs[0].args.value.eq(amount));
      });

      it('transfer the requested amount successfully!', async function () {
        await expectEvent.inTransaction(
          this.token.transfer(sender, amount, { from: owner }),
          'Transfer'
        );
        const senderBalance = await this.token.balanceOf(sender);
        assert.equal(senderBalance, 100);

        const recipientBalance = await this.token.balanceOf(to);
        assert.equal(recipientBalance, 0);
      });

      it('pending transaction when transfer from any blacklist sender', async function () {
        await this.token.transfer(sender, amount, { from: owner });
        // Add sender to blacklist
        await this.token.addAddressToBlacklist(sender, { from: owner });
        await expectEvent.inTransaction(
          this.token.transfer(to, 10, { from: sender }),
          'PendingTransfer'
        );

        let pendingTransfers = await this.token.getPendingTransfers({ from: sender });
        let pendingReceives = await this.token.getPendingReceives({ from: to });
        assert.equal(pendingTransfers.length, 1);
        assert.equal(pendingReceives.length, 1);
      });

      it('pending transactions when transfer from any blacklist sender', async function () {
        await this.token.transfer(sender, amount, { from: owner });
        await this.token.transfer(to, 10, { from: sender });
        // Add sender to blacklist
        await this.token.addAddressToBlacklist(sender, { from: owner });
        await this.token.transfer(to, 20, { from: sender });
        await this.token.transfer(to, 30, { from: sender });
        // Remove sender from blacklist
        await this.token.removeAddressFromBlacklist(sender, { from: owner });
        await this.token.transfer(to, 40, { from: sender });

        let pendingTransfers = await this.token.getPendingTransfers({ from: sender });
        let pendingReceives = await this.token.getPendingReceives({ from: to });
        assert.equal(pendingTransfers.length, 2);
        assert.equal(pendingReceives.length, 2);
      });

      it('confirm pending transaction successfully!', async function () {
        await this.token.transfer(sender, amount, { from: owner });
        await this.token.transfer(to, 10, { from: sender });
        // Add sender to blacklist
        await this.token.addAddressToBlacklist(sender, { from: owner });
        await this.token.transfer(to, 20, { from: sender });

        let pendingReceives = await this.token.getPendingReceives({ from: to });

        await expectEvent.inTransaction(
          this.token.confirmTransfer(pendingReceives[0], { from: to }),
          'TransferConfirmed'
        );
        const fromBalance = await this.token.balanceOf(sender);
        assert.equal(fromBalance, 70);

        const toBalance = await this.token.balanceOf(to);
        assert.equal(toBalance, 30);
      });

      it('cancel pending transaction successfully!', async function () {
        await this.token.transfer(sender, amount, { from: owner });
        await expectEvent.inTransaction(
          this.token.transfer(to, 10, { from: sender }),
          'Transfer'
        );
        // Add sender to blacklist
        await this.token.addAddressToBlacklist(sender, { from: owner });
        await this.token.transfer(to, 20, { from: sender });
        await this.token.transfer(to, 30, { from: sender });

        let pendingReceives = await this.token.getPendingReceives({ from: to });

        await expectEvent.inTransaction(
          this.token.confirmTransfer(pendingReceives[0], { from: to }),
          'TransferConfirmed'
        );
        
        let pendingTransfers = await this.token.getPendingTransfers({ from: sender });
        pendingReceives = await this.token.getPendingReceives({ from: to });
        await expectEvent.inTransaction(
          this.token.cancelTransfer(pendingTransfers[1], { from: sender }),
          'TransferCancelled'
        );

        const ownerBalance = await this.token.balanceOf(sender);
        assert.equal(ownerBalance, 70);

        const receiveBalance = await this.token.balanceOf(to);
        assert.equal(receiveBalance, 30);
      });
    });

    describe('confirm/cancel non-exist transaction', function () {
      const to = recipient;

      it('confirm on zero tnx', async function () {
        await assertRevert(
          this.token.confirmTransfer(ZERO_TX, { from: to })
        );
      });

      it('cancel on zero tnx', async function () {
        await assertRevert(
          this.token.cancelTransfer(ZERO_TX, { from: sender })
        );
      });
    });
  });
});
