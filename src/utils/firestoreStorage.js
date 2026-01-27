import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export const firestoreStorage = {
  async get(userId, key) {
    try {
      const docRef = doc(db, 'users', userId, 'data', key);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { value: docSnap.data().value };
      }
      return null;
    } catch (error) {
      console.error('Error getting data:', error);
      return null;
    }
  },

  async set(userId, key, value) {
    try {
      const docRef = doc(db, 'users', userId, 'data', key);
      await setDoc(docRef, { 
        value, 
        updatedAt: new Date().toISOString() 
      });
      return { value };
    } catch (error) {
      console.error('Error setting data:', error);
      return null;
    }
  },

  async delete(userId, key) {
    try {
      const docRef = doc(db, 'users', userId, 'data', key);
      await deleteDoc(docRef);
      return { deleted: true };
    } catch (error) {
      console.error('Error deleting data:', error);
      return null;
    }
  }
};