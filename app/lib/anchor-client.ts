import { AnchorProvider, Program, web3 } from '@coral-xyz/anchor'
import { Connection, PublicKey } from '@solana/web3.js'
import { AnchorWallet } from '@solana/wallet-adapter-react'

// You'll need to update this with your actual program ID after deployment
export const PROGRAM_ID = new PublicKey('edMGRxyFcpnGj5jqY6VPg4AyF3SJg9ybjjezgsJK33B')

// IDL will be generated after anchor build
// For now, we'll create a basic structure
export const IDL = {
  version: "0.1.0",
  name: "uni_grading",
  instructions: [
    {
      name: "registerUser",
      accounts: [
        { name: "user", isMut: true, isSigner: false },
        { name: "authority", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false }
      ],
      args: [
        { name: "username", type: "string" },
        { name: "role", type: { defined: "UserRole" } }
      ]
    },
    {
      name: "initializeClassroom",
      accounts: [
        { name: "classroom", isMut: true, isSigner: false },
        { name: "authority", isMut: true, isSigner: true },
        { name: "teacherUser", isMut: false, isSigner: false, isOptional: true },
        { name: "systemProgram", isMut: false, isSigner: false }
      ],
      args: [
        { name: "classroomName", type: "string" },
        { name: "course", type: "string" }
      ]
    },
    {
      name: "assignGrade",
      accounts: [
        { name: "student", isMut: true, isSigner: false },
        { name: "teacher", isMut: true, isSigner: true },
        { name: "teacherUser", isMut: false, isSigner: false, isOptional: true }
      ],
      args: [
        { name: "assignmentName", type: "string" },
        { name: "grade", type: "u8" },
        { name: "maxGrade", type: "u8" }
      ]
    }
  ],
  accounts: [
    {
      name: "User",
      type: {
        kind: "struct",
        fields: [
          { name: "authority", type: "publicKey" },
          { name: "username", type: "string" },
          { name: "role", type: { defined: "UserRole" } },
          { name: "createdAt", type: "i64" },
          { name: "isActive", type: "bool" }
        ]
      }
    },
    {
      name: "Classroom",
      type: {
        kind: "struct",
        fields: [
          { name: "name", type: "string" },
          { name: "course", type: "string" },
          { name: "teacher", type: "publicKey" },
          { name: "students", type: { vec: { defined: "StudentRef" } } }
        ]
      }
    },
    {
      name: "Student",
      type: {
        kind: "struct",
        fields: [
          { name: "id", type: "string" },
          { name: "name", type: "string" },
          { name: "classroom", type: "publicKey" },
          { name: "grades", type: { vec: { defined: "Grade" } } }
        ]
      }
    }
  ],
  types: [
    {
      name: "UserRole",
      type: {
        kind: "enum",
        variants: [
          { name: "Teacher" },
          { name: "Student" },
          { name: "Admin" }
        ]
      }
    },
    {
      name: "Grade",
      type: {
        kind: "struct",
        fields: [
          { name: "assignmentName", type: "string" },
          { name: "grade", type: "u8" },
          { name: "maxGrade", type: "u8" },
          { name: "timestamp", type: "i64" },
          { name: "gradedBy", type: "publicKey" }
        ]
      }
    },
    {
      name: "StudentRef",
      type: {
        kind: "struct",
        fields: [
          { name: "name", type: "string" },
          { name: "pubkey", type: "publicKey" }
        ]
      }
    }
  ]
}

export function getProgram(connection: Connection, wallet: AnchorWallet) {
  const provider = new AnchorProvider(connection, wallet, {})
  return new Program(IDL as any, provider)
}

export function getProvider(connection: Connection, wallet: AnchorWallet) {
  return new AnchorProvider(connection, wallet, {})
}
