import crypto from "crypto"
import { Wallet } from "ethers";
import { Keypair as StellerKeyPair } from "stellar-base";
import { derivePath } from "ed25519-hd-key";
import { Keypair as SolKeypair, PublicKey, Enum } from "@solana/web3.js";

const bip39 = require("bip39"); // npm i bip39
const StellarHDWallet = require("stellar-hd-wallet");

/**
 * Represents the type of coin for blockchain.
 * @enum {string}
 */
enum BlockchainTypeEnum {
    Ethereum = "60",
    Stellar = "148",
    Solana = "501",
}

/**
 * Represents the keys for Solana blockchain.
 * @typedef {Object} SolKeys
 * @property {PublicKey} publicKey - The public key.
 * @property {string} secretKey - The secret key.
 */
interface SolKeys {
    publicKey: PublicKey;
    secretKey: string;
}
/**
 * Service for working with seed phrases and generating accounts for different blockchains.
 */
class SeedPhraseService {
    #mnemonic?: string;
    #checkMnemonic(): void {
        if (!this.#mnemonic) throw new Error("Mnemonic not set");
    }
    getMnemonic(): string {
        this.#checkMnemonic;
        return this.#mnemonic!;
    }

    /**
   * Generates the account path for a given blockchain type and account index.
   * @private
   * @param {BlockchainTypeEnum} blockchainType - The type of blockchain.
   * @param {number} accountIndex - The account index.
   * @returns {string} The generated account path.
   */
    static #generateAccountPath(
        blockchainType: BlockchainTypeEnum,
        accountIndex = 0
    ): string {
        return `m/44'/${blockchainType}'/${accountIndex}'/0'`;
    }

    /**
   * Generates accounts for a given blockchain type, account index, and mnemonic.
   * @private
   * @param {BlockchainType} blockchainType - The type of blockchain.
   * @param {number} accountIndex - The account index.
   * @param {string} mnemonic - The mnemonic.
   * @returns {(Wallet|StellerKeyPair|SolKeys)} The generated account.
   */
  static #generateAccount(
    blockchainType: BlockchainTypeEnum = BlockchainTypeEnum.Ethereum,
    accountIndex = 0,
    mnemonic: string
  ): Wallet | StellerKeyPair | SolKeys {
    switch (blockchainType) {
      case BlockchainTypeEnum.Ethereum: {
        const path = this.#generateAccountPath(
          BlockchainTypeEnum.Ethereum,
          accountIndex
        );
        return Wallet.fromMnemonic(mnemonic, path);
      }

      case BlockchainTypeEnum.Stellar: {
        const wallet = StellarHDWallet.fromMnemonic(mnemonic);
        return wallet.getKeypair(accountIndex);
      }

      case BlockchainTypeEnum.Solana: {
        let path = this.#generateAccountPath(
          BlockchainTypeEnum.Solana,
          accountIndex
        );

        const seed = SeedPhraseService.generateSeedPhraseFromMnemonic(mnemonic);
        const keypair = SolKeypair.fromSeed(
          derivePath(path, seed.toString("hex")).key
        );
        return {
            publicKey: keypair.publicKey,
            secretKey: Buffer.from(keypair.secretKey).toString("hex"),
          } as SolKeys;
      }
    }
  }

  /**
   * Generates accounts for a given blockchain type and mnemonic.
   * @param {BlockchainType} blockchainType - The type of blockchain.
   * @param {number} accountIndex - The account index.
   * @param {string} mnemonic - The mnemonic.
   * @returns {(Wallet|StellerKeyPair|SolKeys)} The generated account.
   */
  static generateAccountsFromMnemonic(
    blockchainType: BlockchainTypeEnum = BlockchainTypeEnum.Ethereum,
    accountIndex = 0,
    mnemonic: string
  ): Wallet | StellerKeyPair | SolKeys {
    return this.#generateAccount(blockchainType, accountIndex, mnemonic);
  }

  /**
   * Generates a seed phrase from a given mnemonic.
   * @param {string} mnemonic - The mnemonic to generate the seed phrase from.
   * @returns {Buffer} The generated seed phrase as a buffer.
   * @throws {Error} If the mnemonic is invalid.
   */
  static generateSeedPhraseFromMnemonic(mnemonic: string): Buffer {
    if (!this.validateMnemonic(mnemonic)) throw TypeError("Invalid Mnemonic");
    return bip39.mnemonicToSeedSync(mnemonic);
  }

  /**
   * Validates a mnemonic.
   * @param {string} mnemonic - The mnemonic to validate.
   * @returns {boolean} True if the mnemonic is valid, false otherwise.
   */
  static validateMnemonic(mnemonic: string): boolean {
    return bip39.validateMnemonic(mnemonic);
  }

  /**
   * Retrieves the seed phrase generated from the stored mnemonic.
   * @returns {Buffer} The generated seed phrase as a buffer.
   * @throws {Error} If the mnemonic is not found or not generated.
   */
  getMnemonicSeedPhrase(): Buffer {
    this.#checkMnemonic();
    return bip39.mnemonicToSeedSync(this.#mnemonic as string);
  }

  /**
   * Generates a new mnemonic phrase.
   * @returns {Promise<string>} A promise that resolves to the generated mnemonic phrase.
   */
  async generateMnemonic(): Promise<string> {
    const randomBytes = await crypto.randomBytes(16); // 128 bits

    //  12 word phrase
    this.#mnemonic = await bip39.entropyToMnemonic(randomBytes.toString("hex"));

    return this.#mnemonic as string;
  }
}

export { SeedPhraseService, BlockchainTypeEnum as BlockchainType, SolKeys };