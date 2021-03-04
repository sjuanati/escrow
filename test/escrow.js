const { expectRevert } = require('@openzeppelin/test-helpers');
const Escrow = artifacts.require('Escrow.sol');

const STATUS = {
    Order: 0,
    Complete: 1,
    Complain: 2,
};

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const ethToWei = (item) => web3.utils.toWei(item);

contract('Escrow', accounts => {
    let escrow;
    const [admin, buyer1, buyer2, seller1, seller2] = accounts;

    beforeEach(async () => {
        escrow = await Escrow.new();
        await escrow.offer('apple', 2, 10, { from: seller1 });
    });

    /**************************** O F F E R **************************** */

    it('should create an offer', async() => {
        let item = await escrow.items.call('apple');

        assert(item.seller === seller1, 'seller does not match with item');
        assert(item.price.toNumber() === 2, 'price does not match with item');
        assert(item.amount.toNumber() === 10, 'amount does not match with item');
    });

    it('should update an offer', async() => {
        await escrow.offer('apple', 4, 5, { from: seller1 });
        let item = await escrow.items.call('apple');

        assert(item.price.toNumber() === 4, 'price does not match with item');
        assert(item.amount.toNumber() === 15, 'amount does not match with item');
    });

    it('should not create an offer', async() => {
        await expectRevert(
            escrow.offer('table', 0, 3, {from: seller1}),
            'amount & price must be higher than 0'
        );
    });

    /**************************** O R D E R **************************** */


    /************************* C O M P L E T E ************************* */


    /************************* C O M P L A I N ************************* */

});
