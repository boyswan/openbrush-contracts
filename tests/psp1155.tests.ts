import { bnArg, expect, setupContract, fromSigner } from './helpers'

describe('MY_PSP1155', () => {
    async function setup() {
        return setupContract('my_psp1155', 'new')
    }

    async function setup_receiver() {
        return setupContract('psp1155_receiver', 'new')
    }

    it('PSP 1155 - receiver can reject the transfer', async () => {
        const { tx, query, defaultSigner: sender } = await setup()

        const { contract } = await setup_receiver()

        // Arrange
        await expect(query.balanceOfBatch([[contract.address, bnArg(0)], [sender.address, bnArg(0)]])).to.have.output([0, 1])

        // Act - Receiver wants to reject the next transfer
        await expect(contract.tx.revertNextTransfer()).to.eventually.be.fulfilled

        // Assert - Sender cannot send token to receiver
        await expect(tx.safeTransferFrom(sender.address, contract.address, bnArg(0), 1, 'data')).to.eventually.be.rejected
        await expect(query.balanceOfBatch([[contract.address, bnArg(0)], [sender.address, bnArg(0)]])).to.have.output([0, 1])
    })

    it('Balance of works', async () => {
        const { query, defaultSigner: sender } = await setup()

        await expect(query.balanceOf(sender.address, bnArg(0))).to.have.output(1)
    })

    it('Balance of batch works', async () => {
        const { query, defaultSigner: sender } = await setup()

        let token1 = bnArg(0)
        let token2 = bnArg(1)
        let token1Amount = 1
        let token2Amount = 20

        await expect(query.balanceOfBatch([[sender.address, token1], [sender.address, token2]]))
            .to.have.output([token1Amount, token2Amount])
    })

    it('Set approval works', async () => {
        const { contract, query, defaultSigner: sender, accounts: [alice] } = await setup()

        await expect(query.isApprovedForAll(sender.address, alice.address))
            .to.have.output(false)

        await contract.tx.setApprovalForAll(alice.address, true)
        await expect(query.isApprovedForAll(sender.address, alice.address))
            .to.have.output(true)

        await contract.tx.setApprovalForAll(alice.address, false)
        await expect(query.isApprovedForAll(sender.address, alice.address))
            .to.have.output(false)
    })

    it('Transfer from single works', async () => {
        const { contract, query, defaultSigner: sender, accounts: [alice] } = await setup()

        let tokenId = bnArg(0)
        let tokenId2 = bnArg(1)
        let transferAmount = 1
        let token2Amount = 10

        await fromSigner(contract, alice.address).tx.setApprovalForAll(sender.address, true)
        await contract.tx.safeTransferFrom(sender.address, alice.address, tokenId2, token2Amount, [])
        await expect(query.balanceOfBatch([[sender.address, tokenId], [sender.address, tokenId2], [alice.address, tokenId], [alice.address, tokenId2]]))
            .to.have.output([transferAmount, token2Amount, 0, token2Amount])

        await contract.tx.safeTransferFrom(sender.address, alice.address, tokenId, transferAmount, [])
        await contract.tx.safeTransferFrom(alice.address, sender.address, tokenId2, transferAmount, [])

        await expect(query.balanceOfBatch([[sender.address, tokenId], [sender.address, tokenId2], [alice.address, tokenId], [alice.address, tokenId2]]))
            .to.have.output([0, token2Amount + 1, transferAmount, token2Amount - 1])
    })

    it('Transfer from batch works', async () => {
        const { contract, query, defaultSigner: sender, accounts: [alice] } = await setup()

        let token1 = bnArg(0)
        let token2 = bnArg(1)
        let amount1 = 1
        let amount2 = 20

        await expect(query.balanceOfBatch([[sender.address, token1], [sender.address, token2], [alice.address, token1], [alice.address, token2]]))
            .to.have.output([amount1, amount2, 0, 0])
        await fromSigner(contract, alice.address).tx.setApprovalForAll(sender.address, true)

        await expect(contract.tx.safeBatchTransferFrom(sender.address, alice.address, [[token1, amount1], [token2, amount2]], []))
            .to.eventually.be.fulfilled
        await expect(contract.tx.safeBatchTransferFrom(alice.address, sender.address, [[token1, amount1], [token2, amount2]], []))
            .to.eventually.be.fulfilled

        await expect(query.balanceOfBatch([[sender.address, token1], [sender.address, token2], [alice.address, token1], [alice.address, token2]]))
            .to.have.output([amount1, amount2, 0, 0])
    })

    it('Transfer from single insufficient balance should fail', async () => {
        const { contract, defaultSigner: sender, query, accounts: [alice] } = await setup()

        let tokenId = bnArg(0)
        let tokenAmount = 1

        await expect(query.balanceOf(sender.address, tokenId)).to.have.output(tokenAmount)
        await fromSigner(contract, alice.address).tx.setApprovalForAll(sender.address, true)

        await expect(contract.tx.safeTransferFrom(sender.address, alice.address, tokenId, tokenAmount + 1, []))
            .to.eventually.be.rejected

        await expect(query.balanceOf(sender.address, tokenId)).to.have.output(tokenAmount)
    })

    it('Transfer from single without allowance should fail', async () => {
        const { contract, defaultSigner: sender, accounts: [alice], query } = await setup()

        let tokenId = bnArg(0)
        let tokenAmount = 1

        await expect(query.balanceOf(sender.address, tokenId)).to.have.output(tokenAmount)

        await expect(fromSigner(contract, alice.address).tx.safeTransferFrom(sender.address, alice.address, tokenId, tokenAmount, []))
            .to.eventually.be.rejected

        await expect(query.balanceOf(sender.address, tokenId)).to.have.output(tokenAmount)
    })

    it('Transfer from batch insufficient balance should fail', async () => {
        const { contract, defaultSigner: sender, accounts: [alice], query } = await setup()

        let token1 = bnArg(0)
        let token2 = bnArg(1)
        let amount1 = 1
        let amount2 = 20

        await expect(query.balanceOfBatch([[sender.address, token1], [sender.address, token2]]))
            .to.have.output([amount1, amount2])
        await expect(query.balanceOfBatch([[alice.address, token1], [alice.address, token2]]))
            .to.have.output([0, 0])
        await contract.tx.setApprovalForAll(alice.address, true)

        await expect(
            fromSigner(contract, alice.address)
                .tx.safeBatchTransferFrom(sender.address, alice.address, [[token1, amount1 + 1], [token2, amount2]], [])
        ).to.eventually.be.rejected

        await expect(query.balanceOfBatch([[sender.address, token1], [sender.address, token2]]))
            .to.have.output([amount1, amount2])
        await expect(query.balanceOfBatch([[alice.address, token1], [alice.address, token2]]))
            .to.have.output([0, 0])
    })

})