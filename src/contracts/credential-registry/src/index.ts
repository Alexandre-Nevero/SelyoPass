import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}




export type DataKey = {tag: "AnchorRegistry", values: void} | {tag: "Credential", values: readonly [Buffer]};

export const CredentialError = {
  1: {message:"AlreadyExists"},
  2: {message:"NotFound"},
  3: {message:"IssuerNotAuthorized"},
  4: {message:"InvalidTransition"},
  5: {message:"NotOriginalIssuer"},
  6: {message:"CredentialExpired"},
  7: {message:"InvalidExpiry"},
  8: {message:"ConfigurationMissing"}
}


export interface CredentialRecord {
  credential_id: Buffer;
  document_root: Buffer;
  expires_ledger: u32;
  issuer: Option<string>;
  reason_code: Option<u32>;
  requested_at: u64;
  requested_ledger: u32;
  schema_hash: Buffer;
  status: CredentialStatus;
  subject: string;
  updated_at: u64;
  updated_ledger: u32;
}

export enum CredentialStatus {
  Requested = 1,
  Issued = 2,
  Rejected = 3,
  Revoked = 4,
  Expired = 5,
}





export interface Client {
  /**
   * Construct and simulate a get transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get: ({credential_id}: {credential_id: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<CredentialRecord>>>

  /**
   * Construct and simulate a issue transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  issue: ({issuer, credential_id}: {issuer: string, credential_id: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<CredentialRecord>>>

  /**
   * Construct and simulate a exists transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  exists: ({credential_id}: {credential_id: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a reject transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  reject: ({issuer, credential_id, reason_code}: {issuer: string, credential_id: Buffer, reason_code: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<CredentialRecord>>>

  /**
   * Construct and simulate a revoke transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  revoke: ({issuer, credential_id, reason_code}: {issuer: string, credential_id: Buffer, reason_code: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<CredentialRecord>>>

  /**
   * Construct and simulate a status transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  status: ({credential_id}: {credential_id: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<CredentialStatus>>>

  /**
   * Construct and simulate a request transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  request: ({subject, credential_id, document_root, schema_hash, expires_ledger}: {subject: string, credential_id: Buffer, document_root: Buffer, schema_hash: Buffer, expires_ledger: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<CredentialRecord>>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
        /** Constructor/Initialization Args for the contract's `__constructor` method */
        {anchor_registry}: {anchor_registry: string},
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy({anchor_registry}, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAgAAAAAAAAAAAAAADkFuY2hvclJlZ2lzdHJ5AAAAAAABAAAAAAAAAApDcmVkZW50aWFsAAAAAAABAAAD7gAAACA=",
        "AAAAAAAAAAAAAAADZ2V0AAAAAAEAAAAAAAAADWNyZWRlbnRpYWxfaWQAAAAAAAPuAAAAIAAAAAEAAAPpAAAH0AAAABBDcmVkZW50aWFsUmVjb3JkAAAH0AAAAA9DcmVkZW50aWFsRXJyb3IA",
        "AAAABAAAAAAAAAAAAAAAD0NyZWRlbnRpYWxFcnJvcgAAAAAIAAAAAAAAAA1BbHJlYWR5RXhpc3RzAAAAAAAAAQAAAAAAAAAITm90Rm91bmQAAAACAAAAAAAAABNJc3N1ZXJOb3RBdXRob3JpemVkAAAAAAMAAAAAAAAAEUludmFsaWRUcmFuc2l0aW9uAAAAAAAABAAAAAAAAAARTm90T3JpZ2luYWxJc3N1ZXIAAAAAAAAFAAAAAAAAABFDcmVkZW50aWFsRXhwaXJlZAAAAAAAAAYAAAAAAAAADUludmFsaWRFeHBpcnkAAAAAAAAHAAAAAAAAABRDb25maWd1cmF0aW9uTWlzc2luZwAAAAg=",
        "AAAAAQAAAAAAAAAAAAAAEENyZWRlbnRpYWxSZWNvcmQAAAAMAAAAAAAAAA1jcmVkZW50aWFsX2lkAAAAAAAD7gAAACAAAAAAAAAADWRvY3VtZW50X3Jvb3QAAAAAAAPuAAAAIAAAAAAAAAAOZXhwaXJlc19sZWRnZXIAAAAAAAQAAAAAAAAABmlzc3VlcgAAAAAD6AAAABMAAAAAAAAAC3JlYXNvbl9jb2RlAAAAA+gAAAAEAAAAAAAAAAxyZXF1ZXN0ZWRfYXQAAAAGAAAAAAAAABByZXF1ZXN0ZWRfbGVkZ2VyAAAABAAAAAAAAAALc2NoZW1hX2hhc2gAAAAD7gAAACAAAAAAAAAABnN0YXR1cwAAAAAH0AAAABBDcmVkZW50aWFsU3RhdHVzAAAAAAAAAAdzdWJqZWN0AAAAABMAAAAAAAAACnVwZGF0ZWRfYXQAAAAAAAYAAAAAAAAADnVwZGF0ZWRfbGVkZ2VyAAAAAAAE",
        "AAAAAwAAAAAAAAAAAAAAEENyZWRlbnRpYWxTdGF0dXMAAAAFAAAAAAAAAAlSZXF1ZXN0ZWQAAAAAAAABAAAAAAAAAAZJc3N1ZWQAAAAAAAIAAAAAAAAACFJlamVjdGVkAAAAAwAAAAAAAAAHUmV2b2tlZAAAAAAEAAAAAAAAAAdFeHBpcmVkAAAAAAU=",
        "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" ]),
      options
    )
  }
  public readonly fromJSON = {
    get: this.txFromJSON<Result<CredentialRecord>>,
        issue: this.txFromJSON<Result<CredentialRecord>>,
        exists: this.txFromJSON<boolean>,
        reject: this.txFromJSON<Result<CredentialRecord>>,
        revoke: this.txFromJSON<Result<CredentialRecord>>,
        status: this.txFromJSON<Result<CredentialStatus>>,
        request: this.txFromJSON<Result<CredentialRecord>>
  }
}