# 

![OpenBrush](https://user-images.githubusercontent.com/88630083/218825486-accc2d8c-bc5c-4b92-a278-a5b9009fd6f5.png)

[![Docs](https://img.shields.io/badge/docs-%F0%9F%93%84-blue)](https://727-Ventures.github.io/openbrush-contracts)
[![telegram chat](https://img.shields.io/badge/Telegram-blue.svg?style=flat-square)](https://t.me/openbrush)
[![element chat](https://img.shields.io/badge/Element-green.svg?style=flat-square)](https://matrix.to/#/!utTuYglskDvqRRMQta:matrix.org?via=matrix.org&via=t2bot.io&via=matrix.parity.io)
[![discord chat](https://img.shields.io/badge/Discord-purple.svg?style=flat-square)](https://discord.com/invite/EARg6RCThP)

OpenBrush is maintained by the [Brushfam](https://www.brushfam.io/) team, and was created to make ink! development faster, safer and easier. We plan to integrate most of the features OpenBrush into ink!. OpenBrush provides documentation with FAQ section.

If you have any questions regarding OpenBrush, you can join the [Brushfam Element channel](https://matrix.to/#/!utTuYglskDvqRRMQta:matrix.org?via=matrix.org&via=t2bot.io&via=web3.foundation) to find your answers and meet other ink! smart contracts developers, or ask questions regarding ink! development on Element, Discord, or Telegram OpenBrush channels by the links above.

## Summary
**OpenBrush is a library for smart contract development on ink!.**

Why use this library?
- To make contracts **interoperable** to do **safe** cross-contracts calls (by having the same functions signature among every contracts)
- To ensure the usage of [Polkadot Standards Proposals](https://github.com/w3f/PSPs)
- To ensure the usage of the **latest & most secure** implementation
- Useful contracts that provide custom logic to be implemented in contracts
- To **save time** by not writing boilerplate code
- Useful features which can simplify development
- All contracts are upgradeable by default

Which Standard tokens & useful contracts does it provide?
- **PSP22** - Fungible Token (*ERC20 equivalent*) with extensions
- **PSP34** - Non-Fungible Token (*ERC721 equivalent*) with extensions
- **PSP37** - *ERC1155 equivalent* with extensions
- **Ownable** Restrict access to action for non-owners
- **Access Control** Define set of roles and restrict access to action by roles
- **Reentrancy guard** Prevent reentrant calls to a function
- **Pausable** Pause/Unpause the contract to disable/enable some operations
- **Timelock Controller** Execute transactions with some delay
- **Payment Splitter** Split amount of native tokens between participants

### Default implementation in ink! traits

You can provide a default implementation in the traits method and have internal functions. 
You can use the ink! trait as a native rust trait with several restrictions regarding 
external functions(functions marked `#[ink(message)]`).

```rust
#[openbrush::trait_definition]
pub trait Governance: AccessControl {
    #[ink(message)]
    fn execute(&mut self, transaction: Transaction) -> Result<(), GovernanceError> {
        self.internal_execute(transaction)
    }

    fn internal_execute(&mut self, transaction: Transaction) -> Result<(), GovernanceError> {
        ...
    }
}
```

### Modifiers

Solidity smart contracts provides modifiers to restrain function call to certain pre-defined parameters. OpenBrush provides attribute macros to use standardised modifiers.
You can use our useful contracts to use as modifiers, or define your own modifiers.

```rust
// Before execution of `mint` method, `only_owner` should verify that caller is the owner.
#[ink(message)]
#[modifiers(only_owner)]
fn mint(&mut self, ids_amounts: Vec<(Id, Balance)>) -> Result<(), PSP1155Error> {
  self._mint_to(Self::env().caller(), ids_amounts)
}
```

### Wrapper around traits

You are enough to have a trait definition
(you don't need directly a contract that implements that trait) 
to call methods of that trait from some contract in the network
(do a cross contract call).

```rust
// Somewhere defined trait
#[openbrush::trait_definition]
pub trait Trait1 {
    #[ink(message)]
    fn foo(&mut self) -> bool;
}

// You can create wrapper in the place where you defined the trait
// Or if you import **everything** from the file where you define trait
#[openbrush::wrapper]
type Trait1Ref = dyn Trait1;

{
    // It should be `AccountId` of contract in the network that implements `Trait1` trait
    let callee: openbrush::traits::AccountId = [1; 32].into();
    // This code will execute a cross contract call to `callee` contract
    let result_of_foo: bool = Trait1Ref::foo(&callee);
}
```

> **Note**: The trait should be defined with `openbrush::trait_definition`.
The callee contract should implement that trait.

### Additional stuff

- You can use [`test_utils`](https://github.com/727-Ventures/openbrush-contracts/blob/main/lang/src/test_utils.rs#L39)
to simplify unit testing of you code.
- You can use [`traits`](https://github.com/727-Ventures/openbrush-contracts/blob/main/lang/src/traits.rs) that provides some additional
functionality for your code.
- Read our **documentation** in [doc](https://727-Ventures.github.io/openbrush-contracts).
- Go through our **examples** in [examples](examples) to check hot to use the library and ink!.
- Check the [**example of project struct**](https://github.com/727-Ventures/openbrush-contracts/tree/main/example_project_structure) and [according documentation](https://docs.openbrush.io/smart-contracts/example/overview).

Not sure where to start? Use [the interactive generator](https://openbrush.io) to bootstrap your contract and learn about the components offered in OpenBrush.

### ‼️ Important ‼️

Events are not supported currently due to how ink! currently handles them.  
The identifiers of events must be based on the name of the trait. At the moment, ink! doesn't support it,
but it must be fixed with this [issue](https://github.com/paritytech/ink/issues/809).

### Issues to be resolved before the library becomes production-ready:
* [Standard token naming convention](https://github.com/727-Ventures/openbrush-contracts/issues/1)
* [Event's identifiers are based on the naming of the storage structure](https://github.com/727-Ventures/openbrush-contracts/issues/2)

### Other Issues open:

* [#[ink::trait_definition] doesn't support generics and default implementation](https://github.com/727-Ventures/openbrush-contracts/issues/4)
* [Library provides implementation in Rust level instead of ink! level](https://github.com/727-Ventures/openbrush-contracts/issues/5)
* [List of issues, solving each of them can simplify usage of library](https://github.com/727-Ventures/openbrush-contracts/issues/8)
* After [Storage rework](https://github.com/paritytech/ink/pull/1217) we need to refactor upgradeable contracts.

## Roadmap 🚗

OpenBrush participates in the Web3 Grants, you can find the roadmap [here](https://github.com/w3f/Grants-Program/blob/master/applications/openbrush-follow-up-2.md)

<details><summary>More common roadmap of tasks</summary>
    
- [x] Implement fungible, non-fungible, and multi tokens.
- [x] Implement AccessControl and Ownable.
- [x] Add examples of how to reuse ERC20, ERC721, AccessControl implementations.
- [x] Stub implementations for `token` and `access` folders.
- [x] Add base description of project
- [x] Remove the boilerplate to make the internal implementation external.
- - [x] Implement `openbrush::contract` macro to consume all openbrush's stuff before ink!.
- - [x] Implement `openbrush::trait_definition` which stores definition of trait and allow to use it in `openbrush::contract` macro.
- - [x] Implement `impl_trait!` macro which reuse internal implementation in external impl section.
- [x] Refactor examples and tests with new macros.
- [x] Decide how to handle errors and implement it in library (Decided to use `panic!` and `assert!`).
- [x] Create derive macro for storage traits. This macro must adds fields to contract's struct.
- [x] Cover all contracts with unit tests and integration tests.
- [x] Create documentation based on readme. Add comments to macros with example of usage.
- [x] Add `Ownable` + `ERC1155` example.
- [x] Support simple modifiers (which can only call functions without code injection).
- [x] Instead of `impl_trait!` macro add support of default implementation in external trait definition.
- [x] Add Pausable, TimelockController and PaymentSplitter contracts.
- [x] Support code injection in modifiers.
- [x] Implement a reentrancy guard and example of usage.
- [x] Add more examples and documentation on how to use the library.
- [x] Finalize PSP for fungible tokens. Refactor of implementation.
- [x] Agnostic traits.
- [x] Wrapper around the trait definition to do a cross-contract calls.
- [X] PSP for NFT token and refactoring according new interface.
- [x] PSP for Multi token and refactoring according new interface.
- [x] Add extension: `PSP34Enumerable`.
- [x] Import all extensions for tokens from OpenZeppelin.
- [x] Add support of upgradeable contracts to ink!/contract-pallet level.
- [x] Implement `Proxy` pattern.
- [x] Implement `Diamond` standard.
- [x] Publish `openbrush` into [crates.io](https://crates.io/crates/openbrush)
- [x] Add documentation for upgradeable contracts.
- [x] Add extension: `AccessControlEnumerable`.
- [x] Add extension: `PSP37Enumerable`.
- [ ] Force/help ink! to create new independent events. During this task decide how ink! can generate metadata for
  events/traits from other crates.
- [ ] Cover everything with UT and integration tests.
- [ ] Improve ink! to allow code injection to have default implementation on ink! level instead Rust level.
- [ ] Refactor the OpenBrush to use default implementation from the ink!.
- [ ] Implement `AssetChainExtension` to work with `asset-pallet`.
- [ ] Implement `PSP22` via `AssetChainExtension`.
- [ ] Implement `UniquesChainExtension` to work with `uniques-pallet`.
- [ ] Implement `PSP34` via `UniquesChainExtension`.
- [ ] Audit.
    
</details>

## Installation & Testing
To work with project you need to install ink! toolchain and NodeJS's dependencies.
- [ink! toolchain](https://docs.substrate.io/tutorials/v3/ink-workshop/pt1/#prerequisites)
- NodeJS deps you can install via `yarn` command

### Build
```
$ yarn build
```
If you want to build in release mode, you can use this command
```
$ yarn build:release
```

### Tests

You can run unit tests by `RUSTFLAGS="-D warnings" cargo +nightly test --workspace --features test-all -- --test-threads=10` command from the root of the directory.

To run integration test you need to start the node with contract-pallet.
- [Setup and start the node with contract-pallet](https://github.com/paritytech/substrate-contracts-node)

After you can run tests by `npm run test` command. It will build all contracts required for integration tests and run them.

## FAQ

### Was it audited?

Contracts in this repository have not yet been audited and contain several vulnerabilities due to the specific of the ink!. 
We know about them and will fix them with a new versions of ink!.
ink! will have soon several major changes, so it does not make sense to audit it now.
ink! is not ready for production at the moment. It requires resolving some issues.

After that, we plan to do an audit.

## License

OpenBrush is released under the [MIT License](LICENSE).
