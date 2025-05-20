import { db } from '../config/firebaseConfig';
import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';

// Kullanıcı koleksiyonu işlemleri
export const userService = {
  // Yeni kullanıcı oluştur
  async createUser(userId, userData) {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, userData);
      return { success: true, data: userData };
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, error };
    }
  },

  // Kullanıcı bilgilerini getir
  async getUser(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return { success: true, data: userSnap.data() };
      } else {
        return { success: false, error: 'User not found' };
      }
    } catch (error) {
      console.error('Error getting user:', error);
      return { success: false, error };
    }
  },

  // Kullanıcı bilgilerini güncelle
  async updateUser(userId, userData) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, userData);
      return { success: true, data: userData };
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, error };
    }
  },

  // Kullanıcıyı sil
  async deleteUser(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { success: false, error };
    }
  }
};

// Resim koleksiyonu işlemleri
export const imageService = {
  // Yeni resim ekle
  async addImage(userId, imageData) {
    try {
      const imagesRef = collection(db, 'users', userId, 'images');
      const docRef = await addDoc(imagesRef, {
        contentType: imageData.contentType || 'image/jpeg',
        fileName: imageData.fileName,
        path: imageData.path,
        size: imageData.size,
        type: 'image',
        url: imageData.url,
        timestamp: new Date()
      });
      return { success: true, data: { id: docRef.id, ...imageData }};
    } catch (error) {
      console.error('Error adding image:', error);
      return { success: false, error };
    }
  },

  // Kullanıcının tüm resimlerini getir
  async getUserImages(userId) {
    try {
      const imagesRef = collection(db, 'users', userId, 'images');
      const querySnapshot = await getDocs(imagesRef);
      const images = [];
      
      querySnapshot.forEach((doc) => {
        images.push({ id: doc.id, ...doc.data() });
      });
      
      return { success: true, data: images };
    } catch (error) {
      console.error('Error getting images:', error);
      return { success: false, error };
    }
  },

  // Belirli bir resmi getir
  async getImage(userId, imageId) {
    try {
      const imageRef = doc(db, 'users', userId, 'images', imageId);
      const imageSnap = await getDoc(imageRef);
      
      if (imageSnap.exists()) {
        return { success: true, data: { id: imageSnap.id, ...imageSnap.data() }};
      } else {
        return { success: false, error: 'Image not found' };
      }
    } catch (error) {
      console.error('Error getting image:', error);
      return { success: false, error };
    }
  },

  // Resim bilgilerini güncelle
  async updateImage(userId, imageId, imageData) {
    try {
      const imageRef = doc(db, 'users', userId, 'images', imageId);
      await updateDoc(imageRef, imageData);
      return { success: true, data: imageData };
    } catch (error) {
      console.error('Error updating image:', error);
      return { success: false, error };
    }
  },

  // Resmi sil
  async deleteImage(userId, imageId) {
    try {
      const imageRef = doc(db, 'users', userId, 'images', imageId);
      await deleteDoc(imageRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting image:', error);
      return { success: false, error };
    }
  }
};

// ImageId koleksiyonu işlemleri
export const imageIdService = {
  // Yeni imageId ekle
  async addImageId(userId, imageId, imageIdData) {
    try {
      const imageIdRef = doc(db, 'userid', userId, 'images', imageId, 'imageId', imageId);
      await setDoc(imageIdRef, {
        ...imageIdData,
        timestamp: new Date()
      });
      return { success: true, data: imageIdData };
    } catch (error) {
      console.error('Error adding imageId:', error);
      return { success: false, error };
    }
  },

  // ImageId bilgilerini getir
  async getImageId(userId, imageId) {
    try {
      const imageIdRef = doc(db, 'userid', userId, 'images', imageId, 'imageId', imageId);
      const imageIdSnap = await getDoc(imageIdRef);
      
      if (imageIdSnap.exists()) {
        return { success: true, data: imageIdSnap.data() };
      } else {
        return { success: false, error: 'ImageId not found' };
      }
    } catch (error) {
      console.error('Error getting imageId:', error);
      return { success: false, error };
    }
  },

  // ImageId bilgilerini güncelle
  async updateImageId(userId, imageId, imageIdData) {
    try {
      const imageIdRef = doc(db, 'userid', userId, 'images', imageId, 'imageId', imageId);
      await updateDoc(imageIdRef, imageIdData);
      return { success: true, data: imageIdData };
    } catch (error) {
      console.error('Error updating imageId:', error);
      return { success: false, error };
    }
  },

  // ImageId'yi sil
  async deleteImageId(userId, imageId) {
    try {
      const imageIdRef = doc(db, 'userid', userId, 'images', imageId, 'imageId', imageId);
      await deleteDoc(imageIdRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting imageId:', error);
      return { success: false, error };
    }
  }
}; 