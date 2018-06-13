const expectEvent = require('../../helpers/expectEvent');
const expectThrow = require('../../helpers/expectThrow');
const assertRevert = require('../../helpers/assertRevert');

const NTFTokenMock = artifacts.require('NTFTokenMock');

require('chai')
  .use(require('chai-as-promised'))
  .should();

contract('NTFToken', function (accounts) {
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
  const ZERO_TX = '0x0000000000000000000000000000000000000000000000000000000000000000';

  let token;

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
    token = await NTFTokenMock.new({ from: owner });
  });

  describe('ownership', function () {
    it('should have an owner', async function () {
      let owner_ = await token.owner();
      assert.isTrue(owner_ !== 0);
      let holders = await token.getHolders();
      assert.equal(holders.length, 1);
      assert.equal(holders[0], owner_);
    });
    
    it('changes owner after transfer', async function () {
      let oldOwner = await token.owner();
      await token.transferOwnership(anyone);
      let owner_ = await token.owner();
    
      assert.isTrue(owner_ === anyone);
      let holders = await token.getHolders();
      assert.equal(holders.length, 1);
      assert.equal(holders[0], oldOwner);
    });

    it('should prevent non-owners from transfering', async function () {
      const owner_ = await token.owner.call();
      assert.isTrue(owner_ !== recipient);
      await assertRevert(token.transferOwnership(recipient, { from: anyone }));
    });

    it('should guard ownership against stuck state', async function () {
      let originalOwner = await token.owner();
      await assertRevert(token.transferOwnership(null, { from: originalOwner }));
    });
  });

  describe('coinbase', function () {
    it('can set the coinbase', async function () {
      await expectEvent.inTransaction(
        token.setCoinbase(recipient, { from: owner }),
        'SetCoinbase'
      );

      let coinbase = await token.getCoinbase({ from: owner });
      assert.equal(coinbase, recipient);
    });

    it('can update the coinbase by re-call set method', async function () {
      await expectEvent.inTransaction(
        token.setCoinbase(recipient, { from: owner }),
        'SetCoinbase'
      );

      // update
      await expectEvent.inTransaction(
        token.setCoinbase(sender, { from: owner }),
        'SetCoinbase'
      );

      let coinbase = await token.getCoinbase({ from: owner });
      assert.equal(coinbase, sender);
    });

    it('cannot set coinbase if the sender dont hold any NTF token', async function () {
      await assertRevert(token.setCoinbase(recipient, { from: sender }));
    });

    it('can set coinbase after receiving NTF token', async function () {
      const amount = 100;
      await expectEvent.inTransaction(
        token.transfer(recipient, amount, { from: owner }),
        'Transfer'
      );

      await expectEvent.inTransaction(
        token.setCoinbase(anyone, { from: recipient }),
        'SetCoinbase'
      );

      let coinbase = await token.getCoinbase({ from: recipient });
      assert.equal(coinbase, anyone);
    });
  });

  describe('total supply', function () {
    it('returns the total amount of tokens', async function () {
      const totalSupply = await token.totalSupply();
      assert.equal(totalSupply, 10000000 * (10 ** 18));
    });
  });

  describe('token holder', function () {
    it('owner is the first and unique token holder from the beginning', async function () {
      let owner_ = await token.owner();
      let holders = await token.getHolders();
      assert.equal(holders.length, 1);
      assert.equal(holders[0], owner_);
    });

    it('a new token holder after transfer token succesfully', async function () {
      const amount = 100;
      await expectEvent.inTransaction(
        token.transfer(recipient, amount, { from: owner }),
        'Transfer'
      );
      let holders = await token.getHolders();
      assert.equal(holders.length, 2);
    });

    it('two new token holders after transfer token succesfully', async function () {
      const amount = 100;
      await expectEvent.inTransaction(
        token.transfer(recipient, amount, { from: owner }),
        'Transfer'
      );
      await expectEvent.inTransaction(
        token.transfer(sender, amount, { from: owner }),
        'Transfer'
      );

      let holders = await token.getHolders();
      assert.equal(holders.length, 3);
    });

    it('some new token holders after transfer token succesfully', async function () {
      const amount = 100;
      await expectEvent.inTransaction(
        token.transfer(recipient, amount, { from: owner }),
        'Transfer'
      );
      await expectEvent.inTransaction(
        token.transfer(sender, amount, { from: owner }),
        'Transfer'
      );
      await expectEvent.inTransaction(
        token.transfer(recipient, amount, { from: sender }),
        'PendingTransfer'
      );
      let holders = await token.getHolders();
      assert.equal(holders.length, 3);
    });

    it('some new token holders after confirm/transfer token succesfully', async function () {
      const amount = 100;
      await expectEvent.inTransaction(
        token.transfer(recipient, amount, { from: owner }),
        'Transfer'
      );
      await expectEvent.inTransaction(
        token.transfer(sender, amount, { from: owner }),
        'Transfer'
      );
      await expectEvent.inTransaction(
        token.transfer(recipient, amount, { from: sender }),
        'PendingTransfer'
      );
      let pendingReceives = await token.getPendingReceives({ from: recipient });
      await expectEvent.inTransaction(
        token.confirmTransfer(pendingReceives[0], { from: recipient }),
        'TransferConfirmed'
      );
      let holders = await token.getHolders();
      assert.equal(holders.length, 2);
    });
  });

  describe('balanceOf', function () {
    describe('when the requested account has no tokens', function () {
      it('returns zero', async function () {
        const balance = await token.balanceOf(anyone);

        assert.equal(balance, 0);
      });
    });
    
    describe('when the requested account has some tokens', function () {
      it('returns the total amount of tokens', async function () {
        const balance = await token.balanceOf(owner);

        assert.equal(balance, 10000000 * (10 ** 18));
      });
    });
  });

  describe('blacklist', function () {
    describe('Only onwer can add/remove address to/from blacklist', function () {
      it('should not allow "anyone" to add a address to the blacklist', async function () {
        await expectThrow(
          token.addAddressToBlacklist(blacklistedAddress1, { from: anyone })
        );
      });
        
      it('should not allow "anyone" to remove a address from the blacklist', async function () {
        await expectThrow(
          token.removeAddressFromBlacklist(blacklistedAddress1, { from: anyone })
        );
      });
    });

    describe('Should add address(es) into blacklist', function () {
      it('should add address to the blacklist', async function () {
        await expectEvent.inTransaction(
          token.addAddressToBlacklist(blacklistedAddress1, { from: owner }),
          'BlacklistedAddressAdded'
        );
        const isBlacklisted = await token.blacklist(blacklistedAddress1);
        isBlacklisted.should.be.equal(true);
      });
      
      it('should add addresses to the blacklist', async function () {
        await expectEvent.inTransaction(
          token.addAddressesToBlacklist(blacklistedAddresses, { from: owner }),
          'BlacklistedAddressAdded'
        );
        for (let addr of blacklistedAddresses) {
          const isBlacklisted = await token.blacklist(addr);
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
          await assertRevert(token.transfer(to, amount, { from: owner }));
        });
      });
    });

    describe('when the recipient is the zero address', function () {
      const to = ZERO_ADDRESS;
  
      it('reverts', async function () {
        await assertRevert(token.transfer(to, 100, { from: owner }));
      });
    });

    describe('when the sender has enough balance', function () {
      const to = recipient;
      const amount = 100;

      it('emits a transfer event', async function () {
        const { logs } = await token.transfer(to, amount, { from: owner });

        assert.equal(logs.length, 1);
        assert.equal(logs[0].event, 'Transfer');
        assert.equal(logs[0].args.from, owner);
        assert.equal(logs[0].args.to, to);
        assert(logs[0].args.value.eq(amount));
      });

      it('transfer the requested amount successfully!', async function () {
        await expectEvent.inTransaction(
          token.transfer(sender, amount, { from: owner }),
          'Transfer'
        );
        const senderBalance = await token.balanceOf(sender);
        assert.equal(senderBalance, 100);

        const recipientBalance = await token.balanceOf(to);
        assert.equal(recipientBalance, 0);
      });

      it('pending transaction when transfer from any sender, not from contract owner', async function () {
        await token.transfer(sender, amount, { from: owner });
        await expectEvent.inTransaction(
          token.transfer(to, 10, { from: sender }),
          'PendingTransfer'
        );

        let pendingTransfers = await token.getPendingTransfers({ from: sender });
        let pendingReceives = await token.getPendingReceives({ from: to });
        assert.equal(pendingTransfers.length, 1);
        assert.equal(pendingReceives.length, 1);
      });

      it('2 pending transactions when transfer 2 times from any sender, not from contract owner', async function () {
        await token.transfer(sender, amount, { from: owner });
        await token.transfer(to, 10, { from: sender });
        await token.transfer(to, 20, { from: sender });

        let pendingTransfers = await token.getPendingTransfers({ from: sender });
        let pendingReceives = await token.getPendingReceives({ from: to });
        assert.equal(pendingTransfers.length, 2);
        assert.equal(pendingReceives.length, 2);
      });

      it('confirm pending transaction successfully!', async function () {
        await token.transfer(sender, amount, { from: owner });
        await token.transfer(to, 10, { from: sender });
        await token.transfer(to, 20, { from: sender });

        let pendingReceives = await token.getPendingReceives({ from: to });

        await expectEvent.inTransaction(
          token.confirmTransfer(pendingReceives[0], { from: to }),
          'TransferConfirmed'
        );
        const fromBalance = await token.balanceOf(sender);
        assert.equal(fromBalance, 90);

        const toBalance = await token.balanceOf(to);
        assert.equal(toBalance, 10);

        let pendingTransfers = await token.getPendingTransfers({ from: sender });
        pendingReceives = await token.getPendingReceives({ from: to });
        assert.equal(pendingTransfers.length, 1);
        assert.equal(pendingReceives.length, 1);
      });

      it('cancel pending transaction successfully!', async function () {
        await token.transfer(sender, amount, { from: owner });
        await token.transfer(to, 10, { from: sender });
        await token.transfer(to, 20, { from: sender });

        let pendingReceives = await token.getPendingReceives({ from: to });

        await expectEvent.inTransaction(
          token.confirmTransfer(pendingReceives[0], { from: to }),
          'TransferConfirmed'
        );
        
        let pendingTransfers = await token.getPendingTransfers({ from: sender });
        pendingReceives = await token.getPendingReceives({ from: to });
        await expectEvent.inTransaction(
          token.cancelTransfer(pendingTransfers[0], { from: sender }),
          'TransferCancelled'
        );
        pendingTransfers = await token.getPendingTransfers({ from: sender });
        pendingReceives = await token.getPendingReceives({ from: to });
        assert.equal(pendingTransfers.length, 0);
        assert.equal(pendingReceives.length, 0);

        const ownerBalance = await token.balanceOf(sender);
        assert.equal(ownerBalance, 90);

        const receiveBalance = await token.balanceOf(to);
        assert.equal(receiveBalance, 10);
      });
    });

    describe('confirm/cancel non-exist transaction', function () {
      const to = recipient;

      it('confirm on zero tnx', async function () {
        await assertRevert(
          token.confirmTransfer(ZERO_TX, { from: to })
        );
      });

      it('cancel on zero tnx', async function () {
        await assertRevert(
          token.cancelTransfer(ZERO_TX, { from: sender })
        );
      });
    });
  });
});
