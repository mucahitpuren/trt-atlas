// Verifies a detached Ed25519 signature exactly the way the app does, so CI can prove that
// what Sparkle's `sign_update` produced is something a build will actually accept.
//
//   swift tools/verify-ed25519.swift <publicKeyBase64> <signatureBase64> <file>
//
// Exits 0 when the signature is valid, 1 when it is not, 2 on bad arguments.
//
// This mirrors `ScriptStore.loadPublicKey()` and its `isValidSignature` call, and only exists
// because the two sides come from different places: the signature is made by Sparkle's tool,
// the check is made by CryptoKit. Sparkle writes `SUPublicEDKey` as the base64 of the raw
// 32-byte Ed25519 public key and the signature as the base64 of the raw 64 bytes, which is
// what `Curve25519.Signing` takes — but that is an assumption about another project's format,
// so it is tested rather than trusted. Keep this in step with ScriptStore.
import CryptoKit
import Foundation

func fail(_ message: String, _ code: Int32) -> Never {
    FileHandle.standardError.write(Data((message + "\n").utf8))
    exit(code)
}

let arguments = CommandLine.arguments
guard arguments.count == 4 else {
    fail("usage: verify-ed25519.swift <publicKeyBase64> <signatureBase64> <file>", 2)
}

guard let rawKey = Data(base64Encoded: arguments[1]) else {
    fail("the public key is not base64", 2)
}
guard let key = try? Curve25519.Signing.PublicKey(rawRepresentation: rawKey) else {
    fail("the public key is not a raw Ed25519 key (got \(rawKey.count) bytes, expected 32)", 2)
}
guard let signature = Data(base64Encoded: arguments[2]) else {
    fail("the signature is not base64", 2)
}
guard let message = FileManager.default.contents(atPath: arguments[3]) else {
    fail("cannot read \(arguments[3])", 2)
}

if key.isValidSignature(signature, for: message) {
    print("ok: \(arguments[3]) (\(message.count) bytes) verifies against the \(rawKey.count)-byte key")
    exit(0)
}
fail("the signature does NOT verify; a published script signed this way would be refused", 1)
