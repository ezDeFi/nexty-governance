const expectEvent = require('../helpers/expectEvent');
const expectThrow = require('../helpers/expectThrow');

const BlacklistMock = artifacts.require('../../contracts/mocks/BlacklistMock.sol');

require('chai')
  .use(require('chai-as-promised'))
  .should();

contract('Blacklist', function (accounts) {
  let mock;
  
  const [
    owner,
    blacklistedAddress1,
    blacklistedAddress2,
    anyone,
  ] = accounts;

  const blacklistedAddresses = [blacklistedAddress1, blacklistedAddress2];

  before(async function () {
    mock = await BlacklistMock.new({ from: owner });
  });

  context('in normal conditions', () => {
    it('should add address to the blacklist', async function () {
      await expectEvent.inTransaction(
        mock.addAddressToBlacklist(blacklistedAddress1, { from: owner }),
        'BlacklistedAddressAdded'
      );
      const isBlacklisted = await mock.blacklist(blacklistedAddress1);
      isBlacklisted.should.be.equal(true);
    });
    
    it('should add addresses to the blacklist', async function () {
      await expectEvent.inTransaction(
        mock.addAddressesToBlacklist(blacklistedAddresses, { from: owner }),
        'BlacklistedAddressAdded'
      );
      for (let addr of blacklistedAddresses) {
        const isBlacklisted = await mock.blacklist(addr);
        isBlacklisted.should.be.equal(true);
      }
    });

    it('should remove address from the blacklist', async function () {
      await expectEvent.inTransaction(
        mock.removeAddressFromBlacklist(blacklistedAddress1, { from: owner }),
        'BlacklistedAddressRemoved'
      );
      let isBlacklisted = await mock.blacklist(blacklistedAddress1);
      isBlacklisted.should.be.equal(false);
    });
    
    it('should remove addresses from the the blacklist', async function () {
      await expectEvent.inTransaction(
        mock.removeAddressesFromBlacklist(blacklistedAddresses, { from: owner }),
        'BlacklistedAddressRemoved'
      );
      for (let addr of blacklistedAddresses) {
        const isBlacklisted = await mock.blacklist(addr);
        isBlacklisted.should.be.equal(false);
      }
    });
    
    it('should allow whitelisted address to call #onlyWhitelistedCanDoThis', async () => {
      await mock.addAddressToBlacklist(blacklistedAddress1, { from: owner });
      await mock.onlyWhitelistedCanDoThis({ from: blacklistedAddress2 })
        .should.be.fulfilled;
    });
  });

  context('in adversarial conditions', () => {
    it('should not allow "anyone" to add to the blacklist', async () => {
      await expectThrow(
        mock.addAddressToBlacklist(blacklistedAddress1, { from: anyone })
      );
    });

    it('should not allow "anyone" to remove from the blacklist', async () => {
      await expectThrow(
        mock.removeAddressFromBlacklist(blacklistedAddress1, { from: anyone })
      );
    });
  });
});
