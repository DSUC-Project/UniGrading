import { useWallet } from '@solana/wallet-adapter-react';
import { useCallback, useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import toast from 'react-hot-toast';

// Types matching the Rust structs
export interface User {
  authority: PublicKey;
  username: string;
  role: 'Teacher' | 'Student' | 'Admin';
  createdAt: number;
  isActive: boolean;
}

export interface Classroom {
  name: string;
  course: string;
  teacher: PublicKey;
  students: StudentRef[];
}

export interface Student {
  id: string;
  name: string;
  grades: Grade[];
  classroom: PublicKey;
}

export interface StudentRef {
  name: string;
  pubkey: PublicKey;
}

export interface Grade {
  assignmentName: string;
  grade: number;
  maxGrade: number;
  timestamp: number;
  gradedBy: PublicKey;
}

export const useUniGrading = () => {
  const wallet = useWallet();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Check for existing user in localStorage when wallet connects
  useEffect(() => {
    if (wallet.connected && wallet.publicKey && !currentUser) {
      const savedUser = localStorage.getItem(`user_${wallet.publicKey.toString()}`);
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
    }
  }, [wallet.connected, wallet.publicKey, currentUser]);

  // Check if user is registered (Mock implementation)
  const checkUserRegistration = useCallback(async (publicKey?: PublicKey): Promise<User | null> => {
    if (!wallet.connected) return null;

    const userKey = publicKey || wallet.publicKey;
    if (!userKey) return null;

    try {
      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Return current user if exists, otherwise null
      return currentUser;
    } catch (error) {
      console.error('Error checking user registration:', error);
      return null;
    }
  }, [wallet.connected, wallet.publicKey, currentUser]);

  // Register user with localStorage persistence
  const registerUser = useCallback(async (
    username: string,
    role: 'Teacher' | 'Student' | 'Admin'
  ): Promise<string | null> => {
    if (!wallet.connected || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    try {
      // Check if user already exists
      const existingUser = localStorage.getItem(`user_${wallet.publicKey?.toString()}`);
      if (existingUser) {
        toast.error('User already registered with this wallet');
        return null;
      }

      // Mock delay to simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create user data
      const userData: User = {
        authority: wallet.publicKey,
        username,
        role,
        createdAt: Date.now() / 1000,
        isActive: true,
      };

      // Save to localStorage
      localStorage.setItem(`user_${wallet.publicKey.toString()}`, JSON.stringify(userData));

      // Add to global users list
      const allUsers = JSON.parse(localStorage.getItem('all_users') || '[]');
      allUsers.push({
        walletAddress: wallet.publicKey.toString(),
        username,
        role,
        createdAt: userData.createdAt,
        isActive: true,
      });
      localStorage.setItem('all_users', JSON.stringify(allUsers));

      setCurrentUser(userData);
      toast.success('User registered successfully!');

      // Return mock transaction signature
      return 'tx_' + Date.now() + '_' + wallet.publicKey.toString().slice(0, 8);
    } catch (error) {
      console.error('Error registering user:', error);
      toast.error(`Failed to register user: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [wallet]);

  // Create classroom with localStorage persistence
  const createClassroom = useCallback(async (
    classroomName: string,
    course: string
  ): Promise<string | null> => {
    if (!wallet.connected || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    if (!currentUser || currentUser.role !== 'Teacher') {
      throw new Error('Only teachers can create classrooms');
    }

    setLoading(true);
    try {
      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create classroom data
      const classroomData = {
        id: 'class_' + Date.now(),
        name: classroomName,
        course,
        teacher: wallet.publicKey.toString(),
        teacherName: currentUser.username,
        students: [],
        createdAt: Date.now() / 1000,
        isActive: true,
      };

      // Save to localStorage
      const allClassrooms = JSON.parse(localStorage.getItem('all_classrooms') || '[]');
      allClassrooms.push(classroomData);
      localStorage.setItem('all_classrooms', JSON.stringify(allClassrooms));

      toast.success(`Classroom "${classroomName}" created successfully!`);
      return 'tx_classroom_' + Date.now() + '_' + wallet.publicKey.toString().slice(0, 8);
    } catch (error) {
      console.error('Error creating classroom:', error);
      toast.error('Failed to create classroom');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [wallet, currentUser]);

  // Add student to classroom (Implementation placeholder)
  const addStudent = useCallback(async (
    _classroomPubkey: PublicKey,
    studentName: string,
    studentId: string
  ): Promise<string | null> => {
    if (!wallet.connected || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    if (!currentUser || currentUser.role !== 'Teacher') {
      throw new Error('Only teachers can add students');
    }

    setLoading(true);
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // TODO: Implement actual student enrollment logic
      toast.success(`Student "${studentName}" (${studentId}) added successfully!`);
      return 'tx_student_' + Date.now() + '_' + wallet.publicKey.toString().slice(0, 8);
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error('Failed to add student');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [wallet, currentUser]);

  // Assign grade with localStorage persistence
  const assignGrade = useCallback(async (
    studentPubkey: PublicKey,
    assignmentName: string,
    grade: number,
    maxGrade: number
  ): Promise<string | null> => {
    if (!wallet.connected || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    if (!currentUser || currentUser.role !== 'Teacher') {
      throw new Error('Only teachers can assign grades');
    }

    setLoading(true);
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Create grade data
      const gradeData = {
        id: 'grade_' + Date.now(),
        studentWallet: studentPubkey.toString(),
        teacherWallet: wallet.publicKey?.toString(),
        teacherName: currentUser.username,
        assignmentName,
        grade,
        maxGrade,
        percentage: Math.round((grade / maxGrade) * 100),
        createdAt: Date.now() / 1000,
        timestamp: Date.now()
      };

      // Save to localStorage
      const allGrades = JSON.parse(localStorage.getItem('all_grades') || '[]');
      allGrades.push(gradeData);
      localStorage.setItem('all_grades', JSON.stringify(allGrades));

      toast.success(`Grade assigned: ${grade}/${maxGrade} (${gradeData.percentage}%) for "${assignmentName}"`);
      return 'tx_grade_' + Date.now() + '_' + wallet.publicKey?.toString().slice(0, 8);
    } catch (error) {
      console.error('Error assigning grade:', error);
      toast.error('Failed to assign grade');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [wallet, currentUser]);

  // Load user data on wallet connection
  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      checkUserRegistration().then(setCurrentUser);
    } else {
      setCurrentUser(null);
    }
  }, [wallet.connected, wallet.publicKey, checkUserRegistration]);

  return {
    // State
    currentUser,
    loading,
    isConnected: wallet.connected,
    publicKey: wallet.publicKey,
    
    // User Management
    registerUser,
    checkUserRegistration,
    
    // Classroom Management
    createClassroom,
    addStudent,
    
    // Grade Management
    assignGrade,
  };
};
