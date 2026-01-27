"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, updateProfile, signInWithPopup } from 'firebase/auth';
import { auth, db, GoogleAuthProvider } from '@/lib/firebase';
import {
  collection, getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  addDoc,
  query,
  where,
  onSnapshot,
  deleteDoc,
  orderBy,
  limit,
  Timestamp,
  arrayUnion,
  arrayRemove,
  Unsubscribe,
  getDocs,
  writeBatch
} from "firebase/firestore";
import { uploadFile } from "@/lib/storage-utils";
import { app } from "@/lib/firebase";
import { preloadedOpportunities } from '@/lib/opportunities-data';
import { preloadedResources } from '@/lib/resources-data';

export type UserRole = 'super_admin' | 'admin' | 'member' | 'user';
export type UserStatus = 'approved' | 'pending' | 'denied';

// This represents our user data structure in Firestore
export interface AppDbUser {
  uid: string;
  email: string;
  name: string;
  usn?: string;
  phone?: string;
  role: UserRole;
  canUpload: boolean;
  status: UserStatus;
  reason?: string;
  photoURL?: string;
  quizScore?: number;
  quizDivision?: string;
  attemptCount?: number;
}

// NEW: Quiz Attempt interface
export interface QuizAttempt {
  userId: string;
  userEmail: string;
  attemptNumber: number;
  answers: number[];
  score: number;
  division: string;
  passed: boolean;
  timestamp: Timestamp;
}

export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

// Project type definition, matches Firestore structure
export interface Project {
  id: string;
  title: string;
  excerpt: string;
  thumbnailImage: string;
  description: string;
  objectives: string[];
  methodology: string;
  outcomes: string;
  teamMembers: string[];
  galleryImages?: string[];
  externalLinks?: { label: string; url: string }[];
  status: SubmissionStatus;
  createdAt: Timestamp;
  authorEmail: string;
  authorName: string;
  rejectionReason?: string;
}

export type ResourceCategory = "Plug-ins" | "Research Papers" | "3D Designs" | "Blueprints";

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: ResourceCategory;
  link: string;
  tags?: string[];
  image?: string;
  status: SubmissionStatus;
  createdAt: Timestamp;
  authorEmail: string;
  authorName: string;
  rejectionReason?: string;
}

export type OpportunityCategory = "event" | "session" | "external" | "alumni";
export type EventType = "Talk" | "Competition" | "Workshop";
export type ExternalType = "Research" | "Internship" | "Project Team" | "Competition";

// Base interface for all opportunities
interface OpportunityBase {
  id: string;
  title: string;
  description: string;
  category: OpportunityCategory;
  status: SubmissionStatus;
  createdAt: Timestamp;
  authorEmail: string;
  authorName: string;
  rejectionReason?: string;
}

export interface EventOpportunity extends OpportunityBase {
  category: "event";
  eventType: EventType;
  date: string; // ISO string
  time: string;
  location: string;
  image?: string;
  host?: string;
}

export interface SessionOpportunity extends OpportunityBase {
  category: "session";
  venue: string;
  time: string;
}

export interface ExternalOpportunity extends OpportunityBase {
  category: "external";
  externalType: ExternalType;
  organization: string;
  eligibility: string;
  deadline: string; // ISO string
  applicationInstructions: string;
}

export type Opportunity = EventOpportunity | SessionOpportunity | ExternalOpportunity;

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string; // Markdown content
  imageUrl?: string;
  tags: string[];
  status: SubmissionStatus;
  createdAt: Timestamp;
  authorEmail: string;
  authorName: string;
  rejectionReason?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  expiresAt: Timestamp;
  createdAt: Timestamp;
}

export interface LeadershipMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
  order: number;
  isVisible: boolean;
}

export interface Alumnus {
  id: string;
  name: string;
  email: string;
  graduationYear: number;
  company: string;
  bio: string;
  photoURL: string;
  socialLinks?: { platform: string; url: string; }[];
}

export interface AlumniOpportunity extends OpportunityBase {
  category: "alumni";
  link: string;  // Added link field
}

// This is our App's user type, which merges Firebase's User with our custom fields.
type AppUser = (User & { role: UserRole; canUpload: boolean; status: UserStatus; permissions?: any; }) | null;

type AddProjectPayload = Omit<Project, 'id' | 'createdAt' | 'status' | 'authorEmail' | 'authorName' | 'rejectionReason'>;
type AddResourcePayload = Omit<Resource, 'id' | 'createdAt' | 'status' | 'authorEmail' | 'authorName' | 'rejectionReason'> & { authorName?: string; tags?: string | string[]; imageFile?: any; imageType?: 'upload' | 'url'; imageUrl?: string; };
type AddOpportunityPayload = Omit<EventOpportunity, 'id' | 'createdAt' | 'status' | 'authorEmail' | 'authorName' | 'rejectionReason' | 'category'> | Omit<SessionOpportunity, 'id' | 'createdAt' | 'status' | 'authorEmail' | 'authorName' | 'rejectionReason' | 'category'> | Omit<ExternalOpportunity, 'id' | 'createdAt' | 'status' | 'authorEmail' | 'authorName' | 'rejectionReason' | 'category'> & { category: OpportunityCategory };
type AddBlogPostPayload = Omit<BlogPost, 'id' | 'createdAt' | 'status' | 'authorEmail' | 'authorName' | 'rejectionReason' | 'tags'> & { tags?: string };
export type AddAnnouncementPayload = Omit<Announcement, 'id' | 'createdAt'>;
export type AddLeaderPayload = Omit<LeadershipMember, 'id'>;
export type EditLeaderPayload = LeadershipMember;
export type AddAlumnusPayload = Omit<Alumnus, 'id'>;
export type EditAlumnusPayload = Alumnus;
export type AddAlumniOpportunityPayload = Omit<AlumniOpportunity, 'id' | 'createdAt' | 'status' | 'authorEmail' | 'authorName' | 'rejectionReason'>;
export type EditAlumniOpportunityPayload = Omit<AlumniOpportunity, 'createdAt' | 'status' | 'authorEmail' | 'authorName' | 'rejectionReason'>;

interface AuthContextType {
  user: AppUser;
  users: AppDbUser[];
  projects: Project[];
  resources: Resource[];
  opportunities: Opportunity[];
  blogPosts: BlogPost[];
  announcements: Announcement[];
  leadership: LeadershipMember[];
  alumni: Alumnus[];
  alumniOpportunities: AlumniOpportunity[];
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<User>;
  signUp: (email: string, pass: string, displayName: string, usn?: string, phone?: string, reason?: string, quizScore?: number, quizAnswers?: number[], quizDivision?: string) => Promise<any>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<User>;
  updateUserProfile: (displayName: string, photoURL?: string | null, photoFile?: File | null) => Promise<void>;
  approveUser: (email: string) => void;
  denyUser: (email: string) => void;
  deleteUser: (email: string) => Promise<void>;
  updateUserRole: (email: string, role: UserRole) => Promise<void>;
  toggleUploadPermission: (email: string, canUpload: boolean) => void;
  requestMembership: (email: string, reason: string) => Promise<void>;
  addProject: (project: AddProjectPayload) => Promise<void>;
  approveProject: (projectId: string) => void;
  rejectProject: (projectId: string, reason: string) => void;
  deleteProject: (projectId: string) => Promise<void>;
  addResource: (resource: AddResourcePayload) => Promise<void>;
  approveResource: (resourceId: string) => void;
  rejectResource: (resourceId: string, reason: string) => void;
  deleteResource: (resourceId: string) => Promise<void>;
  addOpportunity: (opportunity: AddOpportunityPayload) => Promise<void>;
  approveOpportunity: (opportunityId: string) => void;
  rejectOpportunity: (opportunityId: string, reason: string) => void;
  deleteOpportunity: (opportunityId: string) => Promise<void>;
  addBlogPost: (post: AddBlogPostPayload) => Promise<void>;
  approveBlogPost: (postId: string) => void;
  rejectBlogPost: (postId: string, reason: string) => void;
  deleteBlogPost: (postId: string) => Promise<void>;
  addAnnouncement: (announcement: AddAnnouncementPayload) => Promise<void>;
  addLeader: (leader: AddLeaderPayload) => Promise<void>;
  updateLeader: (leader: EditLeaderPayload) => Promise<void>;
  deleteLeader: (leaderId: string) => Promise<void>;
  toggleLeaderVisibility: (leaderId: string, isVisible: boolean) => Promise<void>;
  addAlumnus: (alumnus: AddAlumnusPayload) => Promise<void>;
  updateAlumnus: (alumnus: EditAlumnusPayload) => Promise<void>;
  deleteAlumnus: (alumnusId: string) => Promise<void>;
  addAlumniOpportunity: (opportunity: AddAlumniOpportunityPayload) => Promise<void>;
  updateAlumniOpportunity: (opportunity: EditAlumniOpportunityPayload) => Promise<void>;
  approveAlumniOpportunity: (opportunityId: string) => void;
  rejectAlumniOpportunity: (opportunityId: string, reason: string) => void;
  deleteAlumniOpportunity: (opportunityId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser>(null);
  const [users, setUsers] = useState<AppDbUser[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [leadership, setLeadership] = useState<LeadershipMember[]>([]);
  const [alumni, setAlumni] = useState<Alumnus[]>([]);
  const [alumniOpportunities, setAlumniOpportunities] = useState<AlumniOpportunity[]>([]);
  const [loading, setLoading] = useState(true);

  // This effect handles fetching data based on the user's role.
  useEffect(() => {
    let unsubscribes: Unsubscribe[] = [];
    const projectsCollection = collection(db, 'projects');
    const resourcesCollection = collection(db, 'resources');
    const opportunitiesCollection = collection(db, 'opportunities');
    const blogPostsCollection = collection(db, 'blogPosts');
    const announcementsCollection = collection(db, 'announcements');
    const usersCollection = collection(db, 'users');
    const leadershipCollection = collection(db, 'leadership');

    const sortData = <T extends { createdAt: Timestamp }>(data: T[]): T[] => {
      return data.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
    };

    // Generic error handler for snapshot listeners
    const handleSnapshotError = (error: Error) => {
      if ((error as any).code === "permission-denied") {
        console.warn("Permission denied for a Firestore query. This is expected for non-admin users and can be ignored.");
      } else {
        console.error("Firestore snapshot listener error:", error);
      }
    };

    // Clear previous listeners
    const cleanup = () => unsubscribes.forEach(unsub => unsub());

    if (loading) {
      return;
    }

    const fetchPublicData = () => {
      const approvedProjectsQuery = query(projectsCollection, where('status', '==', 'approved'));
      unsubscribes.push(onSnapshot(approvedProjectsQuery, (snapshot) => {
        const approvedProjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
        setProjects(prev => sortData(Array.from(new Map([...prev, ...approvedProjects].map(p => [p.id, p])).values())));
      }, handleSnapshotError));

      const approvedResourcesQuery = query(resourcesCollection, where('status', '==', 'approved'));
      unsubscribes.push(onSnapshot(approvedResourcesQuery, (snapshot) => {
        const firestoreResources = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resource));
        setResources(sortData(Array.from(new Map([...preloadedResources, ...firestoreResources].map(item => [item.id, item])).values())));
      }, handleSnapshotError));

      const approvedOppsQuery = query(opportunitiesCollection, where('status', '==', 'approved'));
      unsubscribes.push(onSnapshot(approvedOppsQuery, (snapshot) => {
        const firestoreOpps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Opportunity));
        setOpportunities(sortData([...preloadedOpportunities, ...firestoreOpps]));
      }, handleSnapshotError));

      const approvedBlogPostsQuery = query(blogPostsCollection, where('status', '==', 'approved'));
      unsubscribes.push(onSnapshot(approvedBlogPostsQuery, snapshot => {
        const approvedPosts = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as BlogPost));
        setBlogPosts(prev => sortData(Array.from(new Map([...prev, ...approvedPosts].map(p => [p.id, p])).values())));
      }, handleSnapshotError));

      unsubscribes.push(onSnapshot(query(leadershipCollection, orderBy('order')),
        (snapshot) => setLeadership(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LeadershipMember))),
        handleSnapshotError
      ));

      const approvedMembersQuery = query(usersCollection, where('status', '==', 'approved'));
      unsubscribes.push(onSnapshot(approvedMembersQuery, (snapshot) => {
        const approvedUsers = snapshot.docs.map(doc => doc.data() as AppDbUser);
        setUsers(prev => Array.from(new Map([...prev, ...approvedUsers].map(u => [u.uid, u])).values()));
      }, handleSnapshotError));

      const alumniOppsCollection = collection(db, 'alumniOpportunities');
      unsubscribes.push(onSnapshot(alumniOppsCollection, snapshot => {
        const firestoreOpps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AlumniOpportunity));
        setAlumniOpportunities(sortData(firestoreOpps));
      }, handleSnapshotError));
    };

    const fetchUserData = () => {
      if (!user || !user.email) return;

      const announcementsQuery = query(announcementsCollection, where('expiresAt', '>', Timestamp.now()));
      unsubscribes.push(onSnapshot(announcementsQuery, (snapshot) => {
        setAnnouncements(sortData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement))));
      }, handleSnapshotError));

      const myProjectsQuery = query(projectsCollection, where('authorEmail', '==', user.email));
      unsubscribes.push(onSnapshot(myProjectsQuery, snapshot => {
        const myProjects = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Project));
        setProjects(prev => sortData(Array.from(new Map([...prev, ...myProjects].map(p => [p.id, p])).values())));
      }, handleSnapshotError));

      const myResourcesQuery = query(resourcesCollection, where('authorEmail', '==', user.email));
      unsubscribes.push(onSnapshot(myResourcesQuery, snapshot => {
        const myResources = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Resource));
        setResources(prev => sortData(Array.from(new Map([...prev, ...myResources].map(r => [r.id, r])).values())));
      }, handleSnapshotError));

      const myOpportunitiesQuery = query(opportunitiesCollection, where('authorEmail', '==', user.email));
      unsubscribes.push(onSnapshot(myOpportunitiesQuery, snapshot => {
        const myOpps = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Opportunity));
        setOpportunities(prev => sortData(Array.from(new Map([...prev, ...myOpps].map(o => [o.id, o])).values())));
      }, handleSnapshotError));

      const myBlogPostsQuery = query(blogPostsCollection, where('authorEmail', '==', user.email));
      unsubscribes.push(onSnapshot(myBlogPostsQuery, snapshot => {
        const myPosts = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as BlogPost));
        setBlogPosts(prev => sortData(Array.from(new Map([...prev, ...myPosts].map(p => [p.id, p])).values())));
      }, handleSnapshotError));
    };

    const fetchAdminData = () => {
      if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) return;

      unsubscribes.push(onSnapshot(usersCollection, (snapshot) => {
        setUsers(snapshot.docs.map(doc => doc.data() as AppDbUser));
      }, handleSnapshotError));

      unsubscribes.push(onSnapshot(projectsCollection, snapshot => {
        setProjects(sortData(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Project))));
      }, handleSnapshotError));

      unsubscribes.push(onSnapshot(resourcesCollection, snapshot => {
        const firestoreResources = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resource));
        setResources(sortData(Array.from(new Map([...preloadedResources, ...firestoreResources].map(item => [item.id, item])).values())));
      }, handleSnapshotError));

      unsubscribes.push(onSnapshot(opportunitiesCollection, snapshot => {
        const firestoreOpps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Opportunity));
        setOpportunities(sortData([...preloadedOpportunities, ...firestoreOpps]));
      }, handleSnapshotError));

      unsubscribes.push(onSnapshot(blogPostsCollection, snapshot => {
        setBlogPosts(sortData(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as BlogPost))));
      }, handleSnapshotError));

      const alumniCollection = collection(db, 'alumni');
      unsubscribes.push(onSnapshot(alumniCollection, snapshot => {
        setAlumni(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Alumnus)));
      }, handleSnapshotError));
    };

    cleanup();
    fetchPublicData();

    if (user) {
      fetchUserData();
      fetchAdminData();
    }

    return cleanup;
  }, [loading, user]);

  const handleUser = async (firebaseUser: User | null): Promise<AppUser> => {
    if (!firebaseUser || !firebaseUser.email) return null;

    const userDocRef = doc(db, 'users', firebaseUser.email);
    let dbUser: AppDbUser | undefined;

    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      dbUser = docSnap.data() as AppDbUser;

      if (dbUser.status === 'denied') {
        await firebaseSignOut(auth);
        throw new Error("Access denied. Your membership application was not approved. Please contact an administrator.");
      }

      if (dbUser.quizScore !== undefined && dbUser.quizScore < 10) {
        await firebaseSignOut(auth);
        throw new Error("You did not pass the screening quiz. You cannot access this account.");
      }

    } else {
      const newUser: any = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || 'New User',
        role: 'user',
        canUpload: false,
        status: 'approved',
      };
      if (firebaseUser.photoURL) {
        newUser.photoURL = firebaseUser.photoURL;
      }
      await setDoc(userDocRef, newUser);
      dbUser = newUser;
    }

    if (!dbUser) {
      throw new Error("Failed to initialize user record.");
    }

    if (firebaseUser.displayName !== dbUser.name || (firebaseUser.photoURL && dbUser.photoURL && firebaseUser.photoURL !== dbUser.photoURL)) {
      if (dbUser.name && dbUser.photoURL) {
        await updateProfile(firebaseUser, { displayName: dbUser.name, photoURL: dbUser.photoURL });
      } else if (dbUser.name) {
        await updateProfile(firebaseUser, { displayName: dbUser.name });
      }
    }

    return {
      ...firebaseUser,
      displayName: dbUser.name,
      photoURL: dbUser.photoURL || firebaseUser.photoURL,
      role: dbUser.role,
      canUpload: dbUser.canUpload || dbUser.role === 'admin' || dbUser.role === 'super_admin',
      status: dbUser.status,
      permissions: (dbUser as any).permissions || {},
    };
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        const appUser = await handleUser(firebaseUser);
        setUser(appUser);
      } catch (error: any) {
        console.error(error.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async (email: string, pass: string): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const appUser = await handleUser(userCredential.user);
    if (!appUser) {
      await firebaseSignOut(auth);
      throw new Error("Login failed: could not retrieve user data.");
    }
    setUser(appUser);
    return userCredential.user;
  };

  const signInWithGoogle = async (): Promise<User> => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const appUser = await handleUser(result.user);
    if (!appUser) {
      await firebaseSignOut(auth);
      throw new Error("Login failed: could not retrieve user data.");
    }
    setUser(appUser);
    return result.user;
  }

  const signUp = async (
    email: string,
    pass: string,
    displayName: string,
    usn?: string,
    phone?: string,
    reason?: string,
    quizScore?: number,
    quizAnswers?: number[],
    quizDivision?: string
  ) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(userCredential.user, { displayName });

    const newUser: any = {
      uid: userCredential.user.uid,
      email,
      name: displayName,
      role: 'user',
      canUpload: false,
      status: 'pending',
    };

    if (usn) newUser.usn = usn;
    if (phone) newUser.phone = phone;
    if (reason) newUser.reason = reason;
    if (quizScore !== undefined) newUser.quizScore = quizScore;
    if (quizDivision) newUser.quizDivision = quizDivision;
    if (quizScore !== undefined) newUser.attemptCount = 1;
    if (userCredential.user.photoURL) newUser.photoURL = userCredential.user.photoURL;

    await setDoc(doc(db, 'users', email), newUser);

    if (quizScore !== undefined && quizAnswers && quizDivision) {
      await addDoc(collection(db, 'quizAttempts'), {
        userId: userCredential.user.uid,
        userEmail: email,
        attemptNumber: 1,
        answers: quizAnswers,
        score: quizScore,
        division: quizDivision,
        passed: true,
        timestamp: Timestamp.now(),
      });
    }

    await firebaseSignOut(auth);
    setUser(null);

    return userCredential;
  };

  const requestMembership = async (email: string, reason: string) => {
    const userDocRef = doc(db, 'users', email);
    await updateDoc(userDocRef, {
      status: 'pending',
      reason: reason,
    });
    if (user && user.email === email) {
      setUser({ ...user, status: 'pending' });
    }
  }

  const updateUserProfile = async (displayName: string, photoURL?: string | null, photoFile?: File | null) => {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      throw new Error("No user is currently signed in.");
    }

    let finalPhotoURL = photoURL;

    if (photoFile) {
      finalPhotoURL = await uploadFile(photoFile, `profile-pictures`);
    }

    const profileUpdates: { displayName?: string, photoURL?: string | null } = {};
    const firestoreUpdates: { name?: string, photoURL?: string } = {};

    if (displayName !== currentUser.displayName) {
      profileUpdates.displayName = displayName;
      firestoreUpdates.name = displayName;
    }

    if (finalPhotoURL && finalPhotoURL !== currentUser.photoURL) {
      profileUpdates.photoURL = finalPhotoURL;
      firestoreUpdates.photoURL = finalPhotoURL;
    }

    if (Object.keys(profileUpdates).length > 0) {
      await updateProfile(currentUser, profileUpdates);
    }

    if (Object.keys(firestoreUpdates).length > 0) {
      const userDocRef = doc(db, 'users', currentUser.email);
      await updateDoc(userDocRef, firestoreUpdates);
    }

    const updatedUser = await handleUser(currentUser);
    setUser(updatedUser);
  };

  const approveUser = async (email: string) => {
    try {
      const userDocRef = doc(db, 'users', email);
      await updateDoc(userDocRef, { status: 'approved', role: 'member', canUpload: true });
    } catch (error) {
      console.error("Error approving user:", error);
      throw error;
    }
  };

  const denyUser = async (email: string) => {
    try {
      const userDocRef = doc(db, 'users', email);
      await updateDoc(userDocRef, { status: 'denied' });
    } catch (error) {
      console.error("Error denying user:", error);
      throw error;
    }
  };

  const deleteUser = async (email: string) => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      throw new Error("Only admins can delete users.");
    }

    if (user.email === email) {
      throw new Error("You cannot delete your own account.");
    }

    try {
      const userDocRef = doc(db, 'users', email);
      await deleteDoc(userDocRef);
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  };

  const updateUserRole = async (email: string, role: UserRole) => {
    if (!user) throw new Error("Authentication required.");

    if (user.email === email) {
      throw new Error("You cannot change your own role.");
    }

    if (user.role !== 'super_admin') {
      const canUpdate = user.role === 'admin' && role !== 'admin' && role !== 'super_admin';
      if (!canUpdate) {
        throw new Error("You do not have permission to perform this action.");
      }
    }

    const userDocRef = doc(db, 'users', email);
    const canUpload = role === 'member' || role === 'admin' || role === 'super_admin';

    const updates: any = { role, canUpload };

    if (role === 'admin') {
      updates.permissions = {
        canUpload: true,
        canDelete: true,
        canManageMembers: true,
        canManageShop: true,
        canApproveSubmissions: true,
        canManageOrders: true,
      };
    }

    await updateDoc(userDocRef, updates);
  };

  const toggleUploadPermission = async (email: string, canUpload: boolean) => {
    const userDocRef = doc(db, 'users', email);
    const userToUpdate = users.find(u => u.email === email);
    if (userToUpdate && userToUpdate.role !== 'admin' && userToUpdate.role !== 'super_admin') {
      await updateDoc(userDocRef, { canUpload: canUpload });
    }
  };

  const addProject = async (project: AddProjectPayload) => {
    if (!user || !user.email) throw new Error("User must be logged in to add a project.");
    await addDoc(collection(db, 'projects'), {
      ...project,
      status: 'pending',
      createdAt: Timestamp.now(),
      authorEmail: user.email,
      authorName: user.displayName || 'Unknown',
    });
  };

  const approveProject = async (projectId: string) => {
    const projectDocRef = doc(db, 'projects', projectId);
    await updateDoc(projectDocRef, { status: 'approved', rejectionReason: "" });
  };

  const rejectProject = async (projectId: string, reason: string) => {
    const projectDocRef = doc(db, 'projects', projectId);
    await updateDoc(projectDocRef, { status: 'rejected', rejectionReason: reason });
  };

  const deleteProject = async (projectId: string) => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) throw new Error("Only admins can delete projects.");
    const projectDocRef = doc(db, 'projects', projectId);
    await deleteDoc(projectDocRef);
  };

  const addResource = async (resource: AddResourcePayload) => {
    if (!user || !user.email) throw new Error("User must be logged in to add a resource.");

    const getImage = () => {
      if (resource.imageUrl) {
        return resource.imageUrl;
      }
      if (resource.imageType === 'url' && resource.imageUrl) {
        return resource.imageUrl;
      }
      if (resource.imageType === 'upload' && resource.imageFile?.length > 0) {
        return `https://placehold.co/400/225.png`;
      }
      return undefined;
    }

    const processedTags = typeof resource.tags === 'string'
      ? resource.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      : [];

    await addDoc(collection(db, 'resources'), {
      title: resource.title,
      category: resource.category,
      description: resource.description,
      link: resource.link,
      authorName: resource.authorName || user.displayName || 'Unknown',
      image: getImage(),
      tags: processedTags,
      status: 'pending',
      createdAt: Timestamp.now(),
      authorEmail: user.email,
    });
  };

  const approveResource = async (resourceId: string) => {
    const resourceDocRef = doc(db, 'resources', resourceId);
    await updateDoc(resourceDocRef, { status: 'approved', rejectionReason: "" });
  };

  const rejectResource = async (resourceId: string, reason: string) => {
    const resourceDocRef = doc(db, 'resources', resourceId);
    await updateDoc(resourceDocRef, { status: 'rejected', rejectionReason: reason });
  };

  const deleteResource = async (resourceId: string) => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) throw new Error("Only admins can delete resources.");
    const resourceDocRef = doc(db, 'resources', resourceId);
    await deleteDoc(resourceDocRef);
  };

  const addOpportunity = async (opportunity: AddOpportunityPayload) => {
    if (!user || !user.email) throw new Error("User must be logged in to add an opportunity.");
    await addDoc(collection(db, 'opportunities'), {
      ...opportunity,
      status: 'pending',
      createdAt: Timestamp.now(),
      authorEmail: user.email,
      authorName: user.displayName || 'Unknown',
    });
  }

  const approveOpportunity = async (opportunityId: string) => {
    const opportunityDocRef = doc(db, 'opportunities', opportunityId);
    await updateDoc(opportunityDocRef, { status: 'approved', rejectionReason: "" });
  };

  const rejectOpportunity = async (opportunityId: string, reason: string) => {
    const opportunityDocRef = doc(db, 'opportunities', opportunityId);
    await updateDoc(opportunityDocRef, { status: 'rejected', rejectionReason: reason });
  };

  const deleteOpportunity = async (opportunityId: string) => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) throw new Error("Only admins can delete opportunities.");
    const opportunityDocRef = doc(db, 'opportunities', opportunityId);
    await deleteDoc(opportunityDocRef);
  };

  const addBlogPost = async (post: AddBlogPostPayload) => {
    if (!user || !user.email) throw new Error("User must be logged in to add a blog post.");

    const processedTags = typeof post.tags === 'string'
      ? post.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      : [];

    await addDoc(collection(db, 'blogPosts'), {
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      imageUrl: post.imageUrl || `https://placehold.co/1200x600.png`,
      tags: processedTags,
      status: 'pending',
      createdAt: Timestamp.now(),
      authorEmail: user.email,
      authorName: user.displayName || 'Unknown',
    });
  };

  const approveBlogPost = async (postId: string) => {
    const postDocRef = doc(db, 'blogPosts', postId);
    await updateDoc(postDocRef, { status: 'approved', rejectionReason: "" });
  };

  const rejectBlogPost = async (postId: string, reason: string) => {
    const postDocRef = doc(db, 'blogPosts', postId);
    await updateDoc(postDocRef, { status: 'rejected', rejectionReason: reason });
  };

  const deleteBlogPost = async (postId: string) => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) throw new Error("Only admins can delete blog posts.");
    const postDocRef = doc(db, 'blogPosts', postId);
    await deleteDoc(postDocRef);
  };

  const addAnnouncement = async (announcement: AddAnnouncementPayload) => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) throw new Error("Only admins can create announcements.");
    await addDoc(collection(db, 'announcements'), {
      ...announcement,
      createdAt: Timestamp.now(),
    });
  };

  const addLeader = async (leader: AddLeaderPayload) => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) throw new Error("Only admins can add leaders.");
    await addDoc(collection(db, 'leadership'), leader);
  };

  const updateLeader = async (leader: EditLeaderPayload) => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) throw new Error("Only admins can update leaders.");
    const leaderDocRef = doc(db, 'leadership', leader.id);
    await updateDoc(leaderDocRef, { ...leader });
  };

  const deleteLeader = async (leaderId: string) => {
    if (!user || user.role !== 'admin' && user.role !== 'super_admin') {
      console.error("Attempted to delete leader without admin privileges.");
      throw new Error("Only admins can delete leaders.");
    }
    const leaderDocRef = doc(db, 'leadership', leaderId);
    await deleteDoc(leaderDocRef);
  };

  const toggleLeaderVisibility = async (leaderId: string, isVisible: boolean) => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) throw new Error("Only admins can change leader visibility.");
    const leaderDocRef = doc(db, 'leadership', leaderId);
    await updateDoc(leaderDocRef, { isVisible: isVisible });
  }

  const addAlumnus = async (alumnus: AddAlumnusPayload) => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) throw new Error("Only admins can add alumni.");
    await addDoc(collection(db, 'alumni'), alumnus);
  };

  const updateAlumnus = async (alumnus: EditAlumnusPayload) => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) throw new Error("Only admins can update alumni.");
    const alumnusDocRef = doc(db, 'alumni', alumnus.id);
    await updateDoc(alumnusDocRef, { ...alumnus });
  };

  const deleteAlumnus = async (alumnusId: string) => {
    if (!user || user.role !== 'admin' && user.role !== 'super_admin') {
      throw new Error("Only admins can delete alumni.");
    }
    const alumnusDocRef = doc(db, 'alumni', alumnusId);
    await deleteDoc(alumnusDocRef);
  };

  const addAlumniOpportunity = async (opportunity: AddAlumniOpportunityPayload) => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) throw new Error("Only admins can add alumni opportunities.");
    await addDoc(collection(db, 'alumniOpportunities'), {
      ...opportunity,
      status: 'approved',
      createdAt: Timestamp.now(),
      authorEmail: user.email,
      authorName: user.displayName || 'Unknown',
    });
  }

  const approveAlumniOpportunity = async (opportunityId: string) => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) throw new Error("Only admins can approve alumni opportunities.");
    const opportunityDocRef = doc(db, 'alumniOpportunities', opportunityId);
    await updateDoc(opportunityDocRef, { status: 'approved', rejectionReason: "" });
  };

  const rejectAlumniOpportunity = async (opportunityId: string, reason: string) => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) throw new Error("Only admins can reject alumni opportunities.");
    const opportunityDocRef = doc(db, 'alumniOpportunities', opportunityId);
    await updateDoc(opportunityDocRef, { status: 'rejected', rejectionReason: reason });
  };

  const deleteAlumniOpportunity = async (opportunityId: string) => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) throw new Error("Only admins can delete opportunities.");
    const opportunityDocRef = doc(db, 'alumniOpportunities', opportunityId);
    await deleteDoc(opportunityDocRef);
  };

  const updateAlumniOpportunity = async (opportunity: EditAlumniOpportunityPayload) => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) throw new Error("Only admins can update alumni opportunities.");
    const opportunityDocRef = doc(db, 'alumniOpportunities', opportunity.id);
    await updateDoc(opportunityDocRef, { ...opportunity });
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
  };

  const value = {
    user,
    users,
    projects,
    resources,
    opportunities,
    blogPosts,
    announcements,
    leadership,
    alumni,
    alumniOpportunities,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    updateUserProfile,
    approveUser,
    denyUser,
    deleteUser,
    updateUserRole,
    toggleUploadPermission,
    requestMembership,
    addProject,
    approveProject,
    rejectProject,
    deleteProject,
    addResource,
    approveResource,
    rejectResource,
    deleteResource,
    addOpportunity,
    approveOpportunity,
    rejectOpportunity,
    deleteOpportunity,
    addBlogPost,
    approveBlogPost,
    rejectBlogPost,
    deleteBlogPost,
    addAnnouncement,
    addLeader,
    updateLeader,
    deleteLeader,
    toggleLeaderVisibility,
    addAlumnus,
    updateAlumnus,
    deleteAlumnus,
    addAlumniOpportunity,
    updateAlumniOpportunity,
    approveAlumniOpportunity,
    rejectAlumniOpportunity,
    deleteAlumniOpportunity,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
