
import { User, UserRole } from '../types';

// Changed key to force a fresh data load with the new guest-only dataset
const STORAGE_KEY = 'rambagh_palace_db_v2_guest_only';

// Initialize with comprehensive dummy data (Guests Only)
const initStorage = () => {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    const dummyUsers: User[] = [
      // --- GUESTS (DOMESTIC) ---
      { 
        id: '301', 
        name: 'Amitabh Bachchan', 
        email: 'amitabh@guest.com', 
        role: UserRole.USER, 
        joinedAt: new Date('2025-01-10').toISOString(),
        origin: 'DOMESTIC',
        location: 'Maharashtra',
        idProofType: 'Aadhar Card',
        idProofNumber: '4521-8899-0000'
      },
      { 
        id: '302', 
        name: 'Priya Sharma', 
        email: 'priya.s@guest.com', 
        role: UserRole.USER, 
        joinedAt: new Date('2025-02-05').toISOString(),
        origin: 'DOMESTIC',
        location: 'Rajasthan',
        idProofType: 'Driving License',
        idProofNumber: 'RJ-14-2020-112233'
      },
      { 
        id: '303', 
        name: 'Rahul Dravid', 
        email: 'rahul@guest.com', 
        role: UserRole.USER, 
        joinedAt: new Date('2025-02-12').toISOString(),
        origin: 'DOMESTIC',
        location: 'Karnataka',
        idProofType: 'PAN Card',
        idProofNumber: 'ABCDE1234F'
      },

      // --- GUESTS (INTERNATIONAL) ---
      { 
        id: '401', 
        name: 'John Smith', 
        email: 'john.smith@uk.co', 
        role: UserRole.USER, 
        joinedAt: new Date('2025-01-20').toISOString(),
        origin: 'INTERNATIONAL',
        location: 'United Kingdom',
        idProofType: 'Passport',
        idProofNumber: 'UK-99887766'
      },
      { 
        id: '402', 
        name: 'Sarah Connor', 
        email: 'sarah@usa.net', 
        role: UserRole.USER, 
        joinedAt: new Date('2025-02-14').toISOString(),
        origin: 'INTERNATIONAL',
        location: 'United States',
        idProofType: 'Passport',
        idProofNumber: 'USA-11223344'
      },
      { 
        id: '403', 
        name: 'Sheikh Ahmed', 
        email: 'ahmed@uae.ae', 
        role: UserRole.USER, 
        joinedAt: new Date('2025-02-18').toISOString(),
        origin: 'INTERNATIONAL',
        location: 'United Arab Emirates',
        idProofType: 'Passport',
        idProofNumber: 'UAE-55566677'
      },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dummyUsers));
  }
};

export const getUsers = (): User[] => {
  initStorage();
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const addUser = (user: User): void => {
  const users = getUsers();
  users.push(user);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

export const findUserByEmail = (email: string): User | undefined => {
  const users = getUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
};

export const updateUserPassword = (email: string): boolean => {
  const users = getUsers();
  const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
  if (index !== -1) {
    // In a real app, we would set a real password hash here. 
    // This is just a mock reset action.
    return true;
  }
  return false;
};

export const deleteUser = (userId: string): void => {
  const users = getUsers();
  const newUsers = users.filter(u => u.id !== userId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newUsers));
};
