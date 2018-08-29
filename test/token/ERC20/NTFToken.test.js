const expectEvent = require('../../helpers/expectEvent');
const assertRevert = require('../../helpers/assertRevert');

var NTFToken = artifacts.require('NTFToken');

require('chai')
  .use(require('chai-as-promised'))
  .should();

contract('NTFToken', function (accounts) {
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

  const [
    owner,
    sender,
    recipient,
    anyone,
  ] = accounts;

  beforeEach(async function () {
    this.token = await NTFToken.new();
    await this.token.initialize(owner);
  });

  describe('ownership', function () {
    it('should have an owner', async function () {
      let owner_ = await this.token.owner();
      assert.isTrue(owner_ !== 0);
    });
    
    it('changes owner after transfer', async function () {
      await this.token.transferOwnership(anyone);
      let owner_ = await this.token.owner();
    
      assert.isTrue(owner_ === anyone);
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

  describe('total supply', function () {
    it('returns the total amount of tokens', async function () {
      const totalSupply = await this.token.totalSupply();
      assert.equal(totalSupply, 10000000 * (10 ** 18));
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

      it('transfer the requested amount from owner successfully!', async function () {
        await expectEvent.inTransaction(
          this.token.transfer(sender, amount, { from: owner }),
          'Transfer'
        );
        const senderBalance = await this.token.balanceOf(sender);
        assert.equal(senderBalance, 100);

        const recipientBalance = await this.token.balanceOf(to);
        assert.equal(recipientBalance, 0);
      });

      it('transfer the requested amount from any sender successfully!', async function () {
        await expectEvent.inTransaction(
          this.token.transfer(sender, amount, { from: owner }),
          'Transfer'
        );
        const senderBalance = await this.token.balanceOf(sender);
        assert.equal(senderBalance, 100);

        await expectEvent.inTransaction(
          this.token.transfer(to, amount, { from: sender }),
          'Transfer'
        );

        const recipientBalance = await this.token.balanceOf(to);
        assert.equal(recipientBalance, 100);
      });
    });
  });
});
