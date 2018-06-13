const assertRevert = require('../../helpers/assertRevert');
const StandardSuspendableTokenMock = artifacts.require('StandardSuspendableTokenMock');

contract('StandardSuspendableToken', function ([_, owner, recipient, anotherAccount]) {
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

  beforeEach(async function () {
    this.token = await StandardSuspendableTokenMock.new(owner, 100);
  });

  describe('total supply', function () {
    it('returns the total amount of tokens', async function () {
      const totalSupply = await this.token.totalSupply();

      assert.equal(totalSupply, 100);
    });
  });
});
