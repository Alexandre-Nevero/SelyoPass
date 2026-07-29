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




export type DataKey = {tag: "Admin", values: void} | {tag: "Anchor", values: readonly [string]};

export const AnchorError = {
  1: {message:"IncorrectAdmin"},
  2: {message:"AnchorAlreadyExists"},
  3: {message:"AnchorNotFound"},
  4: {message:"NotInitialized"}
}



export interface Client {
  /**
   * Construct and simulate a add_anchor transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  add_anchor: ({admin, anchor}: {admin: string, anchor: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a is_authorized transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  is_authorized: ({anchor}: {anchor: string}, options?: MethodOptions) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a remove_anchor transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  remove_anchor: ({admin, anchor}: {admin: string, anchor: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
        /** Constructor/Initialization Args for the contract's `__constructor` method */
        {admin}: {admin: string},
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
    return ContractClient.deploy({admin}, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAgAAAAAAAAAAAAAABUFkbWluAAAAAAAAAQAAAAAAAAAGQW5jaG9yAAAAAAABAAAAEw==",
        "AAAABAAAAAAAAAAAAAAAC0FuY2hvckVycm9yAAAAAAQAAAAAAAAADkluY29ycmVjdEFkbWluAAAAAAABAAAAAAAAABNBbmNob3JBbHJlYWR5RXhpc3RzAAAAAAIAAAAAAAAADkFuY2hvck5vdEZvdW5kAAAAAAADAAAAAAAAAA5Ob3RJbml0aWFsaXplZAAAAAAABA==",
        "AAAABQAAAAAAAAAAAAAAC0FuY2hvckFkZGVkAAAAAAEAAAAMYW5jaG9yX2FkZGVkAAAAAgAAAAAAAAAGYW5jaG9yAAAAAAATAAAAAQAAAAAAAAAGbGVkZ2VyAAAAAAAEAAAAAAAAAAI=",
        "AAAABQAAAAAAAAAAAAAADUFuY2hvclJlbW92ZWQAAAAAAAABAAAADmFuY2hvcl9yZW1vdmVkAAAAAAACAAAAAAAAAAZhbmNob3IAAAAAABMAAAABAAAAAAAAAAZsZWRnZXIAAAAAAAQAAAAAAAAAAg==",
        "AAAAAAAAAAAAAAAKYWRkX2FuY2hvcgAAAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAZhbmNob3IAAAAAABMAAAABAAAD6QAAAAIAAAfQAAAAC0FuY2hvckVycm9yAA==",
        "AAAAAAAAAAAAAAANX19jb25zdHJ1Y3RvcgAAAAAAAAEAAAAAAAAABWFkbWluAAAAAAAAEwAAAAA=",
        "AAAAAAAAAAAAAAANaXNfYXV0aG9yaXplZAAAAAAAAAEAAAAAAAAABmFuY2hvcgAAAAAAEwAAAAEAAAAB",
        "AAAAAAAAAAAAAAANcmVtb3ZlX2FuY2hvcgAAAAAAAAIAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAAGYW5jaG9yAAAAAAATAAAAAQAAA+kAAAACAAAH0AAAAAtBbmNob3JFcnJvcgA=" ]),
      options
    )
  }
  public readonly fromJSON = {
    add_anchor: this.txFromJSON<Result<void>>,
        is_authorized: this.txFromJSON<boolean>,
        remove_anchor: this.txFromJSON<Result<void>>
  }
}