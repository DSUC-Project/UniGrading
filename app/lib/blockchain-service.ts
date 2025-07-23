import { Connection, PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { AnchorProvider, Program, BN } from '@coral-xyz/anchor'
import { AnchorWallet } from '@solana/wallet-adapter-react'
import { getProgram, PROGRAM_ID } from './anchor-client'
import { User, Classroom, Grade } from '@/hooks/useUniGrading'
import toast from 'react-hot-toast'

// Connection to Solana devnet
const connection = new Connection(
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  'confirmed'
)

export class BlockchainService {
  private program: Program | null = null
  private provider: AnchorProvider | null = null

  constructor(private wallet: AnchorWallet) {
    this.provider = new AnchorProvider(connection, wallet, {})
    this.program = getProgram(connection, wallet)
  }

  // ==================== USER MANAGEMENT ====================

  async registerUser(username: string, role: 'Teacher' | 'Student' | 'Admin'): Promise<string | null> {
    if (!this.program || !this.wallet.publicKey) {
      throw new Error('Program or wallet not initialized')
    }

    try {
      // Derive user PDA
      const [userPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('user'), this.wallet.publicKey.toBuffer()],
        PROGRAM_ID
      )

      // Check if user already exists
      try {
        const existingUser = await this.program.account.user.fetch(userPda)
        if (existingUser) {
          toast.error('User already registered with this wallet')
          return null
        }
      } catch (error) {
        // User doesn't exist, continue with registration
      }

      // Register user on blockchain
      const tx = await this.program.methods
        .registerUser(username, { [role.toLowerCase()]: {} })
        .accounts({
          user: userPda,
          authority: this.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc()

      toast.success(`User registered successfully! TX: ${tx.slice(0, 8)}...`)
      return tx
    } catch (error) {
      console.error('Blockchain registration failed:', error)
      toast.error('Registration failed. Please try again.')
      throw error
    }
  }

  async getUser(walletAddress?: PublicKey): Promise<User | null> {
    if (!this.program) return null

    const userWallet = walletAddress || this.wallet.publicKey
    if (!userWallet) return null

    try {
      const [userPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('user'), userWallet.toBuffer()],
        PROGRAM_ID
      )

      const userData = await this.program.account.user.fetch(userPda)
      
      return {
        authority: userData.authority,
        username: userData.username,
        role: this.parseRole(userData.role),
        createdAt: userData.createdAt.toNumber(),
        isActive: userData.isActive,
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
      return null
    }
  }

  async getAllUsers(): Promise<User[]> {
    if (!this.program) return []

    try {
      const users = await this.program.account.user.all()
      return users.map(user => ({
        authority: user.account.authority,
        username: user.account.username,
        role: this.parseRole(user.account.role),
        createdAt: user.account.createdAt.toNumber(),
        isActive: user.account.isActive,
      }))
    } catch (error) {
      console.error('Failed to fetch all users:', error)
      return []
    }
  }

  // ==================== CLASSROOM MANAGEMENT ====================

  async createClassroom(name: string, course: string): Promise<string | null> {
    if (!this.program || !this.wallet.publicKey) {
      throw new Error('Program or wallet not initialized')
    }

    try {
      // Generate a unique classroom ID
      const classroomId = Date.now().toString()
      
      const [classroomPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('classroom'), Buffer.from(classroomId)],
        PROGRAM_ID
      )

      const tx = await this.program.methods
        .initializeClassroom(classroomId, name, course)
        .accounts({
          classroom: classroomPda,
          teacher: this.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc()

      toast.success(`Classroom created! TX: ${tx.slice(0, 8)}...`)
      return tx
    } catch (error) {
      console.error('Failed to create classroom:', error)
      toast.error('Failed to create classroom')
      throw error
    }
  }

  async getAllClassrooms(): Promise<Classroom[]> {
    if (!this.program) return []

    try {
      const classrooms = await this.program.account.classroom.all()
      return classrooms.map(classroom => ({
        name: classroom.account.name,
        course: classroom.account.course,
        teacher: classroom.account.teacher,
        students: classroom.account.students || [],
      }))
    } catch (error) {
      console.error('Failed to fetch classrooms:', error)
      return []
    }
  }

  // ==================== GRADE MANAGEMENT ====================

  async addGrade(
    studentWallet: PublicKey,
    assignmentName: string,
    grade: number,
    maxGrade: number
  ): Promise<string | null> {
    if (!this.program || !this.wallet.publicKey) {
      throw new Error('Program or wallet not initialized')
    }

    try {
      // Generate unique grade ID
      const gradeId = `${studentWallet.toString()}_${assignmentName}_${Date.now()}`
      
      const [gradePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('grade'), Buffer.from(gradeId)],
        PROGRAM_ID
      )

      const tx = await this.program.methods
        .addGrade(gradeId, assignmentName, new BN(grade), new BN(maxGrade))
        .accounts({
          grade: gradePda,
          student: studentWallet,
          teacher: this.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc()

      toast.success(`Grade added! TX: ${tx.slice(0, 8)}...`)
      return tx
    } catch (error) {
      console.error('Failed to add grade:', error)
      toast.error('Failed to add grade')
      throw error
    }
  }

  async getAllGrades(): Promise<Grade[]> {
    if (!this.program) return []

    try {
      const grades = await this.program.account.grade.all()
      return grades.map(grade => ({
        assignmentName: grade.account.assignmentName,
        grade: grade.account.grade.toNumber(),
        maxGrade: grade.account.maxGrade.toNumber(),
        timestamp: grade.account.timestamp.toNumber() * 1000, // Convert to milliseconds
        gradedBy: grade.account.teacher,
      }))
    } catch (error) {
      console.error('Failed to fetch grades:', error)
      return []
    }
  }

  // ==================== UTILITY METHODS ====================

  private parseRole(role: any): 'Teacher' | 'Student' | 'Admin' {
    if (role.teacher) return 'Teacher'
    if (role.student) return 'Student'
    if (role.admin) return 'Admin'
    return 'Student' // Default
  }

  async getConnection(): Promise<Connection> {
    return connection
  }

  async getBalance(publicKey?: PublicKey): Promise<number> {
    const wallet = publicKey || this.wallet.publicKey
    if (!wallet) return 0

    try {
      const balance = await connection.getBalance(wallet)
      return balance / LAMPORTS_PER_SOL
    } catch (error) {
      console.error('Failed to get balance:', error)
      return 0
    }
  }

  // Check if program is deployed and accessible
  async checkProgramHealth(): Promise<boolean> {
    try {
      const programInfo = await connection.getAccountInfo(PROGRAM_ID)
      return programInfo !== null && programInfo.executable
    } catch (error) {
      console.error('Program health check failed:', error)
      return false
    }
  }
}

// Export singleton instance creator
export function createBlockchainService(wallet: AnchorWallet): BlockchainService {
  return new BlockchainService(wallet)
}
