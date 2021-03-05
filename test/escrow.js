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

    it('should create an order', async() => {
        await escrow.order('apple', 2, {from: buyer1, value: 4});
        const res = await escrow.getOrder('apple', {from: buyer1});
        const {0: ordered, 1: status} = res;

        assert(ordered.toNumber() === 2, 'ordered amount does not match');
        assert(status.toNumber() === STATUS.Order, 'status does not match');

        let item = await escrow.items.call('apple');

        assert(item.amount.toNumber() === 8, 'remaining amount does not match');
    });

    it('should not create an order - item does not exist', async() => {
        await expectRevert(
            escrow.order('pineapple', 2, {from: buyer1, value: 4}),
            'Item does not exist'
        );
    });

    it('should not create an order - amount not available', async() => {
        await expectRevert(
            escrow.order('apple', 15, {from: buyer1, value: 4}),
            'Amount not available'
        );
    });

    it('should not create an order - wrong price', async() => {
        await expectRevert(
            escrow.order('apple', 2, {from: buyer1, value: 1}),
            'Price sent is not equal to product price'
        );
    });

    /************************* C O M P L E T E ************************* */

    it.only('should complete an order', async() => {
        await escrow.order('apple', 2, {from: buyer1, value: 4});
        await escrow.complete('apple', {from: buyer1});

        const res = await escrow.getOrder('apple', {from: buyer1});
        const {0: ordered, 1: status} = res;

        assert(ordered.toNumber() === 2, 'ordered amount does not match');
        assert(status.toNumber() === STATUS.Complete, 'status does not match');
    });

    it.only('should not complete an order - item not ordered', async() => {
        await expectRevert(
            escrow.complete('banana', {from: buyer1}),
            'Item not ordered or in different status than ORDER'
        );
    });

    it.only('should not complete an order - status is different than <ORDER>', async() => {
        await expectRevert(
            escrow.complete('apple', {from: buyer1}),
            'Item not ordered or in different status than ORDER'
        );
    });

    //TODO: check eth transfer from contract to seller

    /************************* C O M P L A I N ************************* */

});
