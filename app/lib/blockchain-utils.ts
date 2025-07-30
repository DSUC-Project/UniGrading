import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { getProgram, PROGRAM_ID } from './anchor-client';
import { User, Classroom, Student, Grade } from '@/hooks/useUniGrading';

// Solana connection
const connection = new Connection(
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  'confirmed'
);

export interface ProgramWalletInfo {
  programId: string;
  balance: number;
  executable: boolean;
  owner: string;
  lamports: number;
}

export interface TransactionInfo {
  signature: string;
  slot: number;
  blockTime: number | null;
  confirmationStatus: string;
  err: any;
  memo?: string;
}

export interface SystemStats {
  totalUsers: number;
  totalClassrooms: number;
  totalStudents: number;
  totalGrades: number;
  activeUsers: number;
  recentTransactions: TransactionInfo[];
}

export interface BlockchainData {
  currentSlot: number;
  epochInfo: {
    epoch: number;
    slotIndex: number;
    slotsInEpoch: number;
  };
  recentBlockhash: string;
  networkStats: {
    transactionCount: number;
    averageSlotTime: number;
  };
}

/**
 * Get program wallet information
 */
export async function getProgramWalletInfo(): Promise<ProgramWalletInfo> {
  try {
    const programPublicKey = new PublicKey(PROGRAM_ID);
    const accountInfo = await connection.getAccountInfo(programPublicKey);
    
    if (!accountInfo) {
      throw new Error('Program account not found');
    }

    return {
      programId: PROGRAM_ID,
      balance: accountInfo.lamports / LAMPORTS_PER_SOL,
      executable: accountInfo.executable,
      owner: accountInfo.owner.toString(),
      lamports: accountInfo.lamports,
    };
  } catch (error) {
    console.error('Error fetching program wallet info:', error);
    throw error;
  }
}

/**
 * Get recent transactions for the program
 */
export async function getProgramTransactions(limit: number = 10): Promise<TransactionInfo[]> {
  try {
    const programPublicKey = new PublicKey(PROGRAM_ID);
    const signatures = await connection.getSignaturesForAddress(
      programPublicKey,
      { limit }
    );

    return signatures.map(sig => ({
      signature: sig.signature,
      slot: sig.slot || 0,
      blockTime: sig.blockTime,
      confirmationStatus: sig.confirmationStatus || 'unknown',
      err: sig.err,
      memo: sig.memo || undefined,
    }));
  } catch (error) {
    console.error('Error fetching program transactions:', error);
    return [];
  }
}

/**
 * Get blockchain network data
 */
export async function getBlockchainData(): Promise<BlockchainData> {
  try {
    const [currentSlot, epochInfo, recentBlockhash] = await Promise.all([
      connection.getSlot(),
      connection.getEpochInfo(),
      connection.getLatestBlockhash(),
    ]);

    // Get recent performance samples for network stats
    const perfSamples = await connection.getRecentPerformanceSamples(1);
    const sample = perfSamples[0];

    return {
      currentSlot,
      epochInfo,
      recentBlockhash: recentBlockhash.blockhash,
      networkStats: {
        transactionCount: sample?.numTransactions || 0,
        averageSlotTime: sample?.samplePeriodSecs || 0,
      },
    };
  } catch (error) {
    console.error('Error fetching blockchain data:', error);
    throw error;
  }
}

/**
 * Get all users from localStorage (since we're using localStorage for now)
 */
export function getAllUsers(): User[] {
  try {
    const users: User[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('user_')) {
        const userData = localStorage.getItem(key);
        if (userData) {
          users.push(JSON.parse(userData));
        }
      }
    }
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

/**
 * Get all classrooms from localStorage
 */
export function getAllClassrooms(): Classroom[] {
  try {
    const classrooms = localStorage.getItem('all_classrooms');
    return classrooms ? JSON.parse(classrooms) : [];
  } catch (error) {
    console.error('Error fetching classrooms:', error);
    return [];
  }
}

/**
 * Get all students from localStorage
 */
export function getAllStudents(): Student[] {
  try {
    const students = localStorage.getItem('all_students');
    return students ? JSON.parse(students) : [];
  } catch (error) {
    console.error('Error fetching students:', error);
    return [];
  }
}

/**
 * Get all grades from localStorage
 */
export function getAllGrades(): Grade[] {
  try {
    const grades = localStorage.getItem('all_grades');
    return grades ? JSON.parse(grades) : [];
  } catch (error) {
    console.error('Error fetching grades:', error);
    return [];
  }
}

/**
 * Get system statistics
 */
export async function getSystemStats(): Promise<SystemStats> {
  try {
    const users = getAllUsers();
    const classrooms = getAllClassrooms();
    const students = getAllStudents();
    const grades = getAllGrades();
    const recentTransactions = await getProgramTransactions(5);

    return {
      totalUsers: users.length,
      totalClassrooms: classrooms.length,
      totalStudents: students.length,
      totalGrades: grades.length,
      activeUsers: users.filter(user => user.isActive).length,
      recentTransactions,
    };
  } catch (error) {
    console.error('Error fetching system stats:', error);
    throw error;
  }
}

/**
 * Get wallet balance for a given public key
 */
export async function getWalletBalance(publicKey: string): Promise<number> {
  try {
    const pubkey = new PublicKey(publicKey);
    const balance = await connection.getBalance(pubkey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return 0;
  }
}

/**
 * Get transaction details by signature
 */
export async function getTransactionDetails(signature: string) {
  try {
    const transaction = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });
    return transaction;
  } catch (error) {
    console.error('Error fetching transaction details:', error);
    return null;
  }
}

/**
 * Search users by various criteria
 */
export function searchUsers(query: string, filterBy?: 'role' | 'status'): User[] {
  const users = getAllUsers();
  let filtered = users;

  if (query) {
    filtered = filtered.filter(user => 
      user.username.toLowerCase().includes(query.toLowerCase()) ||
      user.authority.toString().includes(query)
    );
  }

  if (filterBy === 'role') {
    // Additional role-based filtering can be added here
  } else if (filterBy === 'status') {
    // Additional status-based filtering can be added here
  }

  return filtered;
}

/**
 * Export data for backup/analysis
 */
export function exportSystemData() {
  const data = {
    users: getAllUsers(),
    classrooms: getAllClassrooms(),
    students: getAllStudents(),
    grades: getAllGrades(),
    exportedAt: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `unigrading-export-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
